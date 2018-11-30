import * as React from "react";

import Popup from "../../components/popup";

//Style
import "./style.scss";

import { Editor, EditorState } from "draft-js";

//AppState
import { AppState } from "../../store";

//Events
import { EventEmitter } from "events";
//Blueprintjs
import {
  AnchorButton,
  FormGroup,
  InputGroup,
  Intent,
  ProgressBar,
  Toaster,
  Position,
  IToaster,
  Tab,
  Tabs,
  NumericInput
} from "@blueprintjs/core";

//Axios
import axios, { AxiosResponse } from "axios";

//Image
import ImageReader, { IImage } from "../../utils/imageReader";

//Icons
import { Icon } from "react-icons-kit";
import { image, remove, download } from "react-icons-kit/fa/";
import { SafeWrapper } from "../../components/common";

//Lodash
import { find, filter } from "lodash";

//Loader
import SimpleLoader from "../../components/loaders/simpleLoader";

//Apply Entity
import { applyAtomicEntity } from "../../components/draft/entity";
import { validateURL } from "../../utils";
import { addEntityImportRule } from "../../components/draft/importOptions";

interface ImageUploaderProps {
  editorState: EditorState;
  editor: Editor;
  updateEditorState: (newEditorState: EditorState) => void;
  //Gets Called for Each File to Upload on the Queue (PROMISE tells if completed)
  onFileUpload: (file: IImage) => Promise<string>;

  //Weather to use the Builtin Image Browser (For Uploaded Images) (but this still needs support for image uploading, URL generation and Image Placement)
  //TODO: Allow users to add custom Image Browsers
  //TODO: Provide an API for interacting with the ImageBrowser
  //For Now just ignore this Feature till it's updated and tested
  useImageBrowser?: boolean;

  //is ImageUploader Disabled
  isDisabled?: boolean;

  //Events
  on?: (
    eventName: string,
    handler: (appState?: AppState, ...args: any[]) => void
  ) => EventEmitter;
  emit?: (eventName: string, ...args: any[]) => boolean;
}

interface ImageUploaderState {
  isAdvancedActive: boolean;
  currentAdvancedTab: string;
  imgURL: string;
  imgWidth: number;
  imgHeight: number;
  error: string;
  isImageLoading: boolean;
}

export class ImageUploader extends React.Component<
  ImageUploaderProps,
  ImageUploaderState
> {
  state: ImageUploaderState;
  popup: Popup;
  imageURLInput: HTMLInputElement;
  uploader: DraggableUploader;
  //Image Reader
  imageReader: ImageReader;

  static defaultProps = {
    useImageBrowser: false
  };

  constructor(props: ImageUploaderProps) {
    super(props);
    this.state = {
      isAdvancedActive: false,
      currentAdvancedTab: "uploader",
      imgURL: null, ///< stays NULL if user selected/uploaded an image instead of a URL
      imgWidth: 120,
      imgHeight: 100,
      error: null,
      isImageLoading: false
    };
    //Init Image Reader
    this.imageReader = new ImageReader();
  }

  showError(err: string) {
    this.setState({ error: err });
  }

  hideErrors() {
    //Hide/Remove All Errors
    this.setState({ error: null });
  }

  startLoading() {
    this.setState({ isImageLoading: true });
  }

  stopLoading() {
    this.setState({ isImageLoading: false });
  }

  onPopupOpen() {}

  hidePopup() {
    this.popup.closePopup();
  }

  onPopupClose() {
    //Clear Component Cache (Errors, activeStates...)
    this.setState({
      isAdvancedActive: false,
      currentAdvancedTab: "browser",
      error: null,
      imgURL: null,
      isImageLoading: false,
      imgWidth: 120,
      imgHeight: 100
    });
  }

  onAdvancedUploaderClick() {
    this.setState({ isAdvancedActive: true });
  }

  handleKeyPress(e: React.KeyboardEvent) {
    if (e.key == "Enter") this.onURLImagePlace();
  }

  onImageURLChange(e: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ imgURL: e.target.value });
  }

  //Create and Places and Image as a Base64 Image Encoded Data as <img src={base64DATA}/>
  //Use this method only when you have a server that is capable of receiving your base64 image data, uploading it and then providing you with the Target Image URL
  //Do not try to use base64 data directlly into image, since it will compromize the experience and makes the editor lagging and non-responding
  async onURLImagePlaceBase64() {
    const { editorState, updateEditorState } = this.props;
    const { imgURL, imgWidth, imgHeight } = this.state;
    //Start Loading
    this.setState({ isImageLoading: true });
    //Load Image Loader (await Promise)
    let image = await this.imageReader
      .readFromURLCORS(imgURL, imgWidth, imgHeight)
      .catch(err => {
        //Stop Loading
        this.setState({ isImageLoading: false });
        //Catch Errors (and show them)
        //toaster.show({ message: err, intent: Intent.DANGER });
        this.showError(err);
        return; ///< Stop!
      });
    if (image) {
      //Start Loading
      this.setState({ isImageLoading: false });
      //Place it
      const newEditorState = applyAtomicEntity(
        editorState,
        "IMAGE",
        "MUTABLE",
        image
      );
      //Update state
      updateEditorState(newEditorState);
    }
  }

  //Creates and Places an img with URL <img src={url}/>
  onURLImagePlace() {
    const { editorState, updateEditorState } = this.props;
    const { imgURL, imgWidth, imgHeight } = this.state;
    //Validate URL
    if (!validateURL(imgURL)) return this.showError("Invalid Link(URL)");
    //Start Loading State
    this.setState({ isImageLoading: true });
    let img = new Image();
    img.src = imgURL;
    //Wait for image loading
    img.onload = () => {
      //Image (From URL)
      const image = ImageReader.createFromURL(imgURL, imgWidth, imgHeight);
      //Apply IMAGE Entity
      const newEditorState = applyAtomicEntity(
        editorState,
        "IMAGE",
        "MUTABLE",
        image
      );
      //Update Editor State
      updateEditorState(newEditorState);
      //Stop Loading
      this.stopLoading();
      //Hide Popup
      this.hidePopup();
    };
    img.onabort = img.onerror = () => {
      //Stop Loading
      this.stopLoading();
      //Show Error
      this.showError("Cannot Load Image from URL, Please Try Again!");
    };
  }

  componentWillMount() {
    //Add Import Rules (for importing <img /> into Editor)
    addEntityImportRule(
      "IMAGE",
      element => {
        return element.tagName === "IMG";
      },
      element => {
        return {
          URL: element.getAttribute("src")
        };
      }
    );
  }

  render() {
    const {
      isDisabled,
      on,
      emit,
      editorState,
      editor,
      updateEditorState,
      onFileUpload,
      useImageBrowser
    } = this.props;
    const {
      isAdvancedActive,
      currentAdvancedTab,
      error,
      isImageLoading,
      imgWidth,
      imgHeight
    } = this.state;

    //Image Uploader Icon
    const icon = <Icon icon={image} />;

    /* Inline Renderers */
    //Header
    const inlineHeader = "Image Uploader";
    //Container
    const inlineContainer = (
      <div
        className="inner-container"
        onKeyPress={this.handleKeyPress.bind(this)}
      >
        <FormGroup
          helperText={error ? error : "Make sure Image URL is Valid"}
          label="Embed Image From URL"
          labelFor="image-url-input"
          labelInfo="required"
          intent={error ? Intent.DANGER : Intent.PRIMARY}
        >
          <InputGroup
            id="image-url-input"
            placeholder="URL"
            intent={error ? Intent.DANGER : Intent.PRIMARY}
            inputRef={input => (this.imageURLInput = input)}
            onKeyPress={this.handleKeyPress.bind(this)}
            onChange={this.onImageURLChange.bind(this)}
          />
        </FormGroup>
        <FormGroup
          label="Image Width"
          labelFor="image-width-input"
          intent={Intent.PRIMARY}
        >
          <NumericInput
            allowNumericCharactersOnly={true}
            buttonPosition="right"
            fill={false}
            placeholder="Width"
            value={imgWidth}
            onValueChange={value => this.setState({ imgWidth: value })}
          />
        </FormGroup>
        <FormGroup
          label="Image Height"
          labelFor="image-height-input"
          intent={Intent.PRIMARY}
        >
          <NumericInput
            allowNumericCharactersOnly={true}
            buttonPosition="right"
            fill={false}
            placeholder="Height"
            value={imgHeight}
            onValueChange={value => this.setState({ imgHeight: value })}
          />
        </FormGroup>
      </div>
    );

    //Footer
    const inlineFooter = (
      <div className="footer-container">
        <AnchorButton
          text="Place Image"
          minimal={true}
          intent={Intent.SUCCESS}
          onClick={this.onURLImagePlace.bind(this)}
          loading={isImageLoading}
        />
        <AnchorButton
          text="Advanced"
          minimal={true}
          intent={Intent.PRIMARY}
          onClick={this.onAdvancedUploaderClick.bind(this)}
          disabled={isImageLoading}
        />
      </div>
    );

    /* Advanced Renderers */
    //Advanced Header
    const advancedHeader = "Advanced Image Uploader";
    //Advanced Container
    const uploader = (
      <div className="inner-container">
        <DraggableUploader
          onFileUpload={onFileUpload}
          ref={uploader => (this.uploader = uploader)}
        />
      </div>
    );

    const imageBrowser = (
      <div className="inner-container">
        <FileBrowser
          editorState={editorState}
          origin={"http://127.0.0.1:3000/getImages"}
          updateEditorState={updateEditorState}
          hidePopup={this.hidePopup.bind(this)}
        />
      </div>
    );

    const advancedContainer = (
      <Tabs
        id="uploader-tabs"
        className="tabs-container"
        onChange={tabID =>
          this.setState({ currentAdvancedTab: tabID.toString() })
        }
        selectedTabId={currentAdvancedTab}
        renderActiveTabPanelOnly={false}
      >
        {useImageBrowser && (
          <Tab id="browser" title="Browser" panel={imageBrowser} />
        )}
        <Tab id="uploader" title="Upload" panel={uploader} />
        <Tabs.Expander />
      </Tabs>
    );
    //Advanced Footer
    const advancedFooter = (
      <div className="footer-container">
        {currentAdvancedTab == "uploader" && (
          <AnchorButton
            text="Upload"
            minimal={false}
            intent={Intent.SUCCESS}
            onClick={() => this.uploader.uploadFiles()}
          />
        )}
      </div>
    );

    //Make sure to Toggle between inline and normal popup states
    const isInline = !isAdvancedActive;

    //Popup
    return (
      <Popup
        canOutsideClose={isInline}
        isInline={isInline}
        isDisabled={isDisabled}
        icon={icon}
        editorState={editorState}
        updateEditorState={updateEditorState}
        editor={editor}
        outsideClkDiscaredElem={["toast", "bp3-toast-message"]}
        on={on}
        emit={emit}
        header={isInline ? inlineHeader : advancedHeader}
        container={isInline ? inlineContainer : advancedContainer}
        footer={isInline ? inlineFooter : advancedFooter}
        didOpen={this.onPopupOpen.bind(this)}
        onClose={this.onPopupClose.bind(this)}
        ref={popup => (this.popup = popup)}
      />
    );
  }
}

//Toaster Notification
let toaster: IToaster;
toaster = Toaster.create({ position: Position.TOP });

//Image Uploader Unit
interface DraggableUploaderProps {
  //Gets Called for each loaded file on the queue (Returns True once the file is uploaded or False for Error)
  onFileUpload: (file: IImage) => Promise<string>;
}

interface DraggableUploaderState {
  loadedFiles: IImage[];
}

class DraggableUploader extends React.Component<
  DraggableUploaderProps,
  DraggableUploaderState
> {
  state: DraggableUploaderState;
  fileBrowserInput: HTMLInputElement;

  constructor(props: DraggableUploaderProps) {
    super(props);
    this.state = {
      loadedFiles: []
    };
  }

  //TODO: Add other file types support cause it only supports Images
  onFileLoad(
    e: React.DragEvent<HTMLInputElement> | React.ChangeEvent<HTMLInputElement>
  ) {
    e.preventDefault();
    e.stopPropagation();
    //Filer Reader
    let fileReader = new FileReader();
    //Selected Files
    const files = (e.target as HTMLInputElement).files;
    //File
    const file = files[0];

    fileReader.onerror = () => {
      //TODO: Add error handling
    };

    fileReader.onabort = () => {
      //TODO: Add Load Abort Handling
    };

    fileReader.onload = () => {
      //Add Loaded File to the List
      let loadedFile: IImage = {
        name: file.name,
        type: ImageReader.convertStrToType(file.type),
        size: file.size,
        data: fileReader.result
      };
      this.addLoadedFile(loadedFile);
    };
    console.warn("UPLOADED IMAGE: ", file);

    //Read Selected Files
    fileReader.readAsDataURL(file);
  }

  //Returns New File
  updateLoadedFile(oldFile: IImage, newFile: IImage): IImage {
    this.setState(prevState => {
      //Create a New Array Instance
      const loadedFiles = [...prevState.loadedFiles];
      //Find and Update the File
      find(loadedFiles, (ldfile, idx) => {
        if (ldfile == oldFile) loadedFiles[idx] = newFile;
      });
      //Update State
      return { loadedFiles };
    });
    return newFile;
  }

  addLoadedFile(file: IImage) {
    //Add New Loaded File To the List
    this.setState(prevState => ({
      loadedFiles: [...prevState.loadedFiles, file]
    }));
  }

  removeLoadedFile(file: IImage) {
    //Remove File from Loaded List
    this.setState(prevState => {
      //Reference List
      let loadedFiles = prevState.loadedFiles;
      //Ignore the File we want to remove
      const newLoadedFiles = filter(loadedFiles, (ldFile, idx) => {
        return ldFile !== file;
      });
      //Update the State
      return { loadedFiles: newLoadedFiles };
    });
  }

  removeAllLoadedFiles() {
    //Remove all loaded Files from list
    this.setState({ loadedFiles: [] });
  }

  showUploadSuccess(msg: string) {
    toaster.show({ message: msg, intent: Intent.SUCCESS });
  }

  showUploadError(msg: string) {
    toaster.show({ message: msg, intent: Intent.DANGER });
  }

  //NOTE: Can be triggered from other Components
  public uploadFiles() {
    const { loadedFiles } = this.state;
    const { onFileUpload } = this.props;
    //Make sure there is at least one image to upload
    if (!loadedFiles || loadedFiles === [])
      return toaster.show({
        message: "Please Choose Images First to Upload them!",
        intent: Intent.WARNING
      });
    //Upload Loaded Files
    loadedFiles.map(file => {
      //Make the File in the Uploading State
      let newFile = this.updateLoadedFile(file, {
        ...file,
        isLoading: true
      });
      //Trigger Upload
      onFileUpload(newFile)
        .then(successMsg => {
          //Not Loading Anymore!
          newFile = this.updateLoadedFile(newFile, {
            ...newFile,
            isLoading: false
          });
          //Show Success Toast
          this.showUploadSuccess(successMsg);
          //Remove after Finishing Upload
          this.removeLoadedFile(newFile);
        })
        .catch(err => {
          //Not Loading Anymore!
          newFile = this.updateLoadedFile(newFile, {
            ...newFile,
            isLoading: false
          });
          //Show Success Toast
          this.showUploadError(
            `Can't Upload File: ${newFile.name.substring(0, 22)}...`
          );
          //Remove after Finishing Upload
          //this.removeLoadedFile(newFile);
          //
        });
    });
  }

  render() {
    const {} = this.props;
    const { loadedFiles } = this.state;

    return (
      <SafeWrapper style={{ display: "flex", flexDirection: "column" }}>
        <div className="sub-header">Drag an Image</div>
        <div className="draggable-container">
          <input
            type="file"
            id="file-uploader-input"
            name="file-uploader-input"
            ref={input => (this.fileBrowserInput = input)}
            onDragOver={e => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDrop={this.onFileLoad.bind(this)}
            onChange={this.onFileLoad.bind(this)}
          />
          <div className="files-preview-container ip-scrollbar-v2">
            {loadedFiles &&
              loadedFiles.map((file, idx) => {
                return (
                  <div className="file" key={idx}>
                    <img src={file.data as string} />
                    <div className="container">
                      <span className="progress-bar">
                        {file.isLoading && <ProgressBar />}
                      </span>
                      <span
                        className="remove-btn"
                        onClick={() => this.removeLoadedFile(file)}
                      >
                        <Icon icon={remove} size={19} />
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
          <div className="helper-text">Drag & Drop Images Here</div>
          <div className="file-uploader-browse">
            <AnchorButton
              text="Browse"
              intent={Intent.PRIMARY}
              minimal={true}
              onClick={() => this.fileBrowserInput.click()}
            />
          </div>
        </div>
      </SafeWrapper>
    );
  }
}

//Image Browser (Server File Browser)
interface FileBrowserProps {
  editorState: EditorState;
  origin: string; ///< URL Represents the ORIGIN to where the request should go to

  onFetch?: (res: AxiosResponse) => IImage[]; ///< When data is Successfully Fetched from the Remote HOST
  updateEditorState: (newEditorState: EditorState) => void;
  hidePopup: () => void;
}

interface FileBrowserState {
  images: IImage[];
  isImagesLoading: boolean;
}

class FileBrowser extends React.Component<FileBrowserProps, FileBrowserState> {
  state: FileBrowserState;

  constructor(props: FileBrowserProps) {
    super(props);
    this.state = {
      images: [], ///< Default as Empty Array is Important
      isImagesLoading: false
    };
  }

  showLoading() {
    this.setState({ isImagesLoading: true });
  }

  hideLoading() {
    this.setState({ isImagesLoading: false });
  }

  componentWillMount() {
    //axios.defaults.headers.common["Access-Control-Allow-Credentials"] = true;
    //axios.defaults.headers.common["Access-Control-Allow-Origin"] = "*";
    const { origin, onFetch } = this.props;
    //Show Loading
    this.showLoading();
    //Fetch Images from Provided Remote Server
    axios
      .get(origin)
      .then(res => {
        //In case the User is providing it's own OnFetch Callback once the data is fetched from the Remote Server
        if (onFetch) {
          const fetchedImages = onFetch(res);
          //Set State
          if (fetchedImages)
            this.setState(prevState => ({
              images: [...prevState.images, ...fetchedImages]
            }));
        }
        //Use Default OnFetch Callback if the user is not providing it's own
        this.setState(prevState => ({
          images: [...prevState.images, ...res.data.images]
        }));
        //Hide Loading
        this.hideLoading();
      })
      .catch(err => {
        //TODO: Add more meaningfull Error Handling and Displaying
        if (err)
          console.error(
            `Error Loading Files from Origin ${origin} Err: ${err.message}`
          );
        //Hide Loading
        this.hideLoading();
      });
  }

  onImageSelect(image: IImage) {
    const { editorState, updateEditorState, hidePopup } = this.props;
    //Apply Image Entity With Data
    const newEditorState = applyAtomicEntity(
      editorState,
      "IMAGE",
      "MUTABLE",
      image
    );
    //Update Editor State
    updateEditorState(newEditorState);
    //Hide Popup
    hidePopup();
  }

  render() {
    const { images, isImagesLoading } = this.state;

    return (
      <div className="file-browser-container ip-scrollbar-v2">
        {!isImagesLoading && <div className="sub-header">Select an Image</div>}
        <SimpleLoader isActive={isImagesLoading} />
        <div className="container">
          {images &&
            images.map((img, idx) => {
              return (
                <div
                  className="file-preview"
                  key={idx}
                  onClick={() => this.onImageSelect(img)}
                >
                  <div className="options">
                    <span className="option">
                      <Icon icon={download} size={16} />
                    </span>
                    <span className="option">
                      <Icon icon={remove} size={16} />
                    </span>
                  </div>
                  <span className="img-preview">
                    <img
                      src={("data:image/png;base64," + img.data) as string}
                    />
                  </span>
                </div>
              );
            })}
        </div>
      </div>
    );
  }
}
