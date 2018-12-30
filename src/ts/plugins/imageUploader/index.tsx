/**
 * NOTE: The Advanced section of the imageUploader is not working and still in early stages of development therefor it is marked as disabled
 */

import * as React from "react";

import Popup from "../../components/popup";

//Style
import "./style.scss";

import { Editor, EditorState } from "draft-js";

//AppState
import { AppState } from "../../store";

//Events
import { EventEmitter } from "events";

import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";

//Building Components
import Button from "../components/button";
import { Intent } from "../components/intent";
import FormGroup from "../components/formGroup";
import InputGroup from "../components/inputGroup";
import Toaster from "../components/toast/toaster";

//Axios
import axios, { AxiosResponse } from "axios";

//Image
import ImageReader, { IImage, IImageType } from "../../utils/imageReader";

//Icons
import Icon from "../../components/toolBar/icon";
import { SafeWrapper } from "../../components/common";

//Lodash
import { find, filter } from "lodash";

//Loader
import SimpleLoader from "../../components/loaders/simpleLoader";

//Apply Entity
import {
  applyAtomicEntity,
  mergeEntityData,
  removeEntity
} from "../../components/draft/entity";
import { validateURL } from "../../utils";
import { addEntityImportRule } from "../../components/draft/importOptions";
import decorators from "../../components/draft/decorators";

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
  currentImageEntityKey: string;
  imgURL: string;
  imgWidth: number;
  imgHeight: number;
  imgWidthError: string;
  imgHeightError: string;
  error: string;
  isImageLoading: boolean;
  isEditMode: boolean;
  didImgDataChange: boolean;
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
      imgWidthError: null,
      imgHeightError: null,
      error: null,
      isImageLoading: false,
      isEditMode: false,
      didImgDataChange: false,
      currentImageEntityKey: null
    };
    //Init Image Reader
    this.imageReader = new ImageReader();
  }

  private showError(err: string) {
    this.setState({ error: err });
  }

  private hideErrors() {
    //Hide/Remove All Errors
    this.setState({ error: null });
  }

  private startLoading() {
    this.setState({ isImageLoading: true });
  }

  private stopLoading() {
    this.setState({ isImageLoading: false });
  }

  private hidePopup() {
    this.popup.closePopup();
  }

  private onPopupClose() {
    //Clear Component Cache (Errors, activeStates...)
    this.setState({
      isAdvancedActive: false,
      currentAdvancedTab: "browser",
      error: null,
      imgURL: null,
      isImageLoading: false,
      isEditMode: false,
      didImgDataChange: false,
      currentImageEntityKey: null,
      imgWidth: 120,
      imgHeight: 100
    });
  }

  private onAdvancedUploaderClick() {
    this.setState({ isAdvancedActive: true });
  }

  private handleKeyPress(e: React.KeyboardEvent) {
    const { isEditMode } = this.state;
    if (e.key == "Enter")
      isEditMode ? this.onImageUpdate() : this.onURLImagePlace();
  }

  private onImageURLChange(e: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ imgURL: e.target.value, didImgDataChange: true });
  }

  private onImageWidthChange(e: React.ChangeEvent<HTMLInputElement>) {
    const numiricValue = parseInt(e.target.value);
    //Validate Numiric Value
    if (isNaN(numiricValue))
      this.setState({ imgWidthError: "this is not a valid Width Number!" });
    else if (this.state.imgWidthError) this.setState({ imgWidthError: null });
    this.setState({
      imgWidth: numiricValue ? numiricValue : 0,
      didImgDataChange: true
    });
  }

  private onImageHeightChange(e: React.ChangeEvent<HTMLInputElement>) {
    const numiricValue = parseInt(e.target.value);
    //Validate Numiric Value
    if (isNaN(numiricValue))
      this.setState({ imgHeightError: "this is not a valid Height Number!" });
    else if (this.state.imgHeightError) this.setState({ imgHeightError: null });
    this.setState({
      imgHeight: numiricValue ? numiricValue : 0,
      didImgDataChange: true
    });
  }

  //Create and Places and Image as a Base64 Image Encoded Data as <img src={base64DATA}/>
  //Use this method only when you have a server that is capable of receiving your base64 image data, uploading it and then providing you with the Target Image URL
  //Do not try to use base64 data directlly into image, since it will compromize the experience and makes the editor lagging and non-responding
  private async onURLImagePlaceBase64() {
    const { editorState, updateEditorState } = this.props;
    const { imgURL, imgWidth, imgHeight } = this.state;
    //Start Loading
    this.startLoading();
    //Load Image Loader (await Promise)
    let image = await this.imageReader
      .readFromURLCORS(imgURL, imgWidth, imgHeight)
      .catch(err => {
        //Stop Loading
        this.setState({ isImageLoading: false });
        //Catch Errors (and show them)
        toaster.show({ text: err, intent: Intent.DANGER });
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
  private onURLImagePlace() {
    const { editorState, updateEditorState } = this.props;
    const {
      imgURL,
      imgWidth,
      imgHeight,
      imgWidthError,
      imgHeightError
    } = this.state;
    //Validate Width & Height
    if (imgWidthError || imgHeightError) return;
    //Validate URL
    if (!validateURL(imgURL)) return this.showError("Invalid Link(URL)");
    //Start Loading State
    this.startLoading();
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
      this.stopLoading();
      this.hidePopup();
    };
    img.onabort = img.onerror = () => {
      this.stopLoading();
      //Show Error
      this.showError("Cannot Load Image from URL, Please Try Again!");
    };
  }

  private onAdvancedTabChange(tabID: string) {
    this.setState({ currentAdvancedTab: tabID });
  }

  private openImageEdit(
    url: string,
    width: number,
    height: number,
    imageEntityKey: string
  ) {
    this.popup.openPopup();
    this.setState({
      imgURL: url,
      imgWidth: width,
      imgHeight: height,
      isEditMode: true,
      currentImageEntityKey: imageEntityKey
    });
  }

  private onImageUpdate() {
    const {
      currentImageEntityKey,
      imgURL,
      imgWidth,
      imgHeight,
      imgWidthError,
      imgHeightError
    } = this.state;
    const { editorState, emit, on, updateEditorState } = this.props;
    //Validate Width & Height
    if (imgWidthError || imgHeightError) return;
    //Validate URL
    if (!validateURL(imgURL)) return this.showError("Invalid Link(URL)");
    //Start Loading State
    this.startLoading();
    let img = new Image();
    img.src = imgURL;
    //Wait for image loading
    img.onload = () => {
      //Image (From URL)
      const image = ImageReader.createFromURL(imgURL, imgWidth, imgHeight);
      //Update IMAGE Entity
      const newEditorState = mergeEntityData(
        editorState,
        decorators(emit, on),
        currentImageEntityKey,
        image
      );
      updateEditorState(newEditorState);
      this.stopLoading();
      this.hidePopup();
    };
    img.onabort = img.onerror = () => {
      this.stopLoading();
      this.showError("Cannot Load Image from URL, Please Try Again!");
    };
  }

  private async onImageRemove(imageEntityKey: string) {
    const { editorState, updateEditorState, emit, on } = this.props;
    const newEditorState = await removeEntity(
      editorState,
      imageEntityKey,
      decorators(emit, on)
    ).catch(err =>
      console.error("ButterFly Editor Error: Cannot Remove Image from Editor!")
    );
    //Set Current Entity Key for later use
    this.setState({ currentImageEntityKey: imageEntityKey });
    if (newEditorState) updateEditorState(newEditorState);
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

  componentDidMount() {
    const { on } = this.props;
    //Register Component's External Events
    //Image Update
    on("EditImage", (appState, data) =>
      //Event emitter sends data as args so it is wrapped on an array
      this.openImageEdit(
        data[0].url,
        data[0].width,
        data[0].height,
        data[0].entityKey
      )
    );
    //Remove Image
    on("RemoveImage", (appSate, data) => this.onImageRemove(data[0].entityKey));
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
      isEditMode,
      didImgDataChange,
      imgURL,
      imgWidth,
      imgHeight,
      imgWidthError,
      imgHeightError
    } = this.state;

    //Image Uploader Icon
    const icon = <Icon icon={"imageUploader"} />;

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
            value={imgURL ? imgURL : ""}
            intent={error ? Intent.DANGER : Intent.PRIMARY}
            inputRef={input => (this.imageURLInput = input)}
            onKeyPress={this.handleKeyPress.bind(this)}
            onChange={this.onImageURLChange.bind(this)}
          />
        </FormGroup>
        <FormGroup
          label="Image Width"
          labelFor="image-width-input"
          intent={imgWidthError ? Intent.DANGER : Intent.PRIMARY}
          helperText={imgWidthError ? imgWidthError : undefined}
        >
          <InputGroup
            intent={imgWidthError ? Intent.DANGER : Intent.PRIMARY}
            placeholder="Width"
            value={String(imgWidth)}
            onChange={this.onImageWidthChange.bind(this)}
          />
          {/* TODO: Add Better Image Width and Height Controllers and Inputs for ensuring a valid number instead of a string */}
        </FormGroup>
        <FormGroup
          label="Image Height"
          labelFor="image-height-input"
          intent={imgHeightError ? Intent.DANGER : Intent.PRIMARY}
          helperText={imgHeightError ? imgHeightError : undefined}
        >
          <InputGroup
            intent={imgHeightError ? Intent.DANGER : Intent.PRIMARY}
            placeholder="Height"
            value={String(imgHeight)}
            onChange={this.onImageHeightChange.bind(this)}
          />
        </FormGroup>
      </div>
    );

    //Footer
    const inlineFooter = (
      <div className="footer-container">
        <Button
          text={isEditMode ? "Update" : "Place Image"}
          minimal={true}
          intent={Intent.SUCCESS}
          onClick={
            isEditMode
              ? this.onImageUpdate.bind(this)
              : this.onURLImagePlace.bind(this)
          }
          isLoading={isImageLoading}
          disabled={!didImgDataChange}
        />
        <Button
          text="Advanced"
          minimal={true}
          intent={Intent.PRIMARY}
          onClick={this.onAdvancedUploaderClick.bind(this)}
          disabled={true}
        />
      </div>
    );

    /* Advanced Renderers */
    //Advanced Header
    const advancedHeader = "Advanced Image Uploader";
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

    //Order Matter for react-tabs to know which one to render first and their indecies
    const tabs = ["browser", "uploader"];
    //Popup Container
    const advancedContainer = (
      <Tabs
        defaultIndex={0}
        onSelect={tabIdx => this.onAdvancedTabChange(tabs[tabIdx])}
      >
        <TabList>
          <Tab>Browser</Tab>
          <Tab>Upload</Tab>
        </TabList>
        <TabPanel>{imageBrowser}</TabPanel>
        <TabPanel>{uploader}</TabPanel>
      </Tabs>
    );
    //Advanced Footer
    const advancedFooter = (
      <div className="footer-container">
        {currentAdvancedTab == "uploader" && (
          <Button
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
        usePortal={isInline}
        icon={icon}
        editorState={editorState}
        updateEditorState={updateEditorState}
        editor={editor}
        on={on}
        emit={emit}
        header={isInline ? inlineHeader : advancedHeader}
        container={isInline ? inlineContainer : advancedContainer}
        footer={isInline ? inlineFooter : advancedFooter}
        onClose={this.onPopupClose.bind(this)}
        ref={popup => (this.popup = popup)}
      />
    );
  }
}

//Toaster Notification
let toaster: Toaster;
toaster = Toaster.create({ intent: Intent.PRIMARY });

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
    toaster.show({ text: msg, intent: Intent.SUCCESS });
  }

  showUploadError(msg: string) {
    toaster.show({ text: msg, intent: Intent.DANGER });
  }

  //NOTE: Can be triggered from other Components
  public uploadFiles() {
    const { loadedFiles } = this.state;
    const { onFileUpload } = this.props;
    //Make sure there is at least one image to upload
    if (!loadedFiles || loadedFiles === [])
      return toaster.show({
        text: "Please Choose Images First to Upload them!",
        intent: Intent.DANGER
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
                        {file.isLoading && <div>Loading...</div>}
                      </span>
                      <span
                        className="remove-btn"
                        onClick={() => this.removeLoadedFile(file)}
                      >
                        <Icon icon={"cross"} size={19} />
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
          <div className="helper-text">Drag & Drop Images Here</div>
          <div className="file-uploader-browse">
            <Button
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
                      <Icon icon={"download"} size={16} />
                    </span>
                    <span className="option">
                      <Icon icon={"cross"} size={16} />
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
