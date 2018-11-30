/* Read an Image either from File or From Remote URL and provide a export object with image data and info */

//Crypt-js used for Base64 encoding/decoding
import { enc } from "crypto-js";

//Axios for Sending HTTP Requests
import axios from "axios";

//Common UTILS
import { validateURL } from "../";
import { decode } from "punycode";

function hexToBase64(str: any) {
  return btoa(
    String.fromCharCode.apply(
      null,
      str
        .replace(/\r|\n/g, "")
        .replace(/([\da-fA-F]{2}) ?/g, "0x$1 ")
        .replace(/ +$/, "")
        .split(" ")
    )
  );
}

function base64ArrayBuffer(arrayBuffer: any) {
  var base64 = "";
  var encodings =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

  var bytes = new Uint8Array(arrayBuffer);
  var byteLength = bytes.byteLength;
  var byteRemainder = byteLength % 3;
  var mainLength = byteLength - byteRemainder;

  var a, b, c, d;
  var chunk;

  // Main loop deals with bytes in chunks of 3
  for (var i = 0; i < mainLength; i = i + 3) {
    // Combine the three bytes into a single integer
    chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];

    // Use bitmasks to extract 6-bit segments from the triplet
    a = (chunk & 16515072) >> 18; // 16515072 = (2^6 - 1) << 18
    b = (chunk & 258048) >> 12; // 258048   = (2^6 - 1) << 12
    c = (chunk & 4032) >> 6; // 4032     = (2^6 - 1) << 6
    d = chunk & 63; // 63       = 2^6 - 1

    // Convert the raw binary segments to the appropriate ASCII encoding
    base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d];
  }

  // Deal with the remaining bytes and padding
  if (byteRemainder == 1) {
    chunk = bytes[mainLength];

    a = (chunk & 252) >> 2; // 252 = (2^6 - 1) << 2

    // Set the 4 least significant bits to zero
    b = (chunk & 3) << 4; // 3   = 2^2 - 1

    base64 += encodings[a] + encodings[b] + "==";
  } else if (byteRemainder == 2) {
    chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1];

    a = (chunk & 64512) >> 10; // 64512 = (2^6 - 1) << 10
    b = (chunk & 1008) >> 4; // 1008  = (2^6 - 1) << 4

    // Set the 2 least significant bits to zero
    c = (chunk & 15) << 2; // 15    = 2^4 - 1

    base64 += encodings[a] + encodings[b] + encodings[c] + "=";
  }

  return base64;
}

export enum IImageType {
  NONE = "NONE",
  PNG = "PNG",
  JPEG = "JPEG",
  GIF = "GIF",
  BITMAP = "BITMAP"
}

type ImageData = string | Blob | ArrayBuffer;

//Either Data or URL properties should be presented
export interface IImage {
  name: string;
  type: IImageType;
  size?: number;
  data?: ImageData;
  URL?: string;
  isLoading?: boolean;
  width?: number;
  height?: number;
}

export default class ImageReader {
  private name: string;
  private type: IImageType;
  private size: number;
  private data: ImageData;
  private isLoading: boolean;
  private width: number;
  private height: number;

  //Valid Base64 (Good for Rendering) Regex
  static validBase64Regex = /(data:image\/(png|jpeg|jpg|gif|bitmap|svg\+xml|svg|);base64,) .+/;

  constructor(
    name?: string,
    type?: IImageType,
    data?: ImageData,
    size?: number
  ) {
    this.name = name;
    this.type = type;
    this.data = data;
    //No size specified, calculate data length
    if (!size) this.size = ImageReader.getDataSize(this.data);
    else this.size = size;
  }

  /**
   * Convert a string image type to IIMageType
   * @param strType
   * @returns IIMageType
   */
  static convertStrToType(strType: string): IImageType {
    let type: IImageType;
    switch (strType) {
      case "image/png":
      case "png":
        type = IImageType.PNG;
        break;
      case "image/jpg":
      case "image/jpeg":
      case "jpeg":
      case "jpg":
        type = IImageType.JPEG;
        break;
      case "image/gif":
      case "gif":
        type = IImageType.GIF;
        break;
      case "image/bitmap":
      case "bitmap":
      case "btmap":
        type = IImageType.BITMAP;
        break;
      default:
        type = IImageType.NONE;
        break;
    }
    return type;
  }

  /**
   * Convert a ImageType to a string type representation
   * @param imageType
   * @returns String
   */
  static convertTypeToStr(imageType: IImageType): string {
    let strType: string;
    switch (imageType) {
      case IImageType.NONE:
        strType = null;
        break;
      case IImageType.PNG:
        strType = "image/png";
        break;
      case IImageType.JPEG:
        strType = "image/jpeg";
        break;
      case IImageType.GIF:
        strType = "image/gif";
        break;
      case IImageType.BITMAP:
        strType = "image/bitmap";
        break;
      default:
        strType = null;
        break;
    }
    return strType;
  }

  static getDataSize(data: ImageData): number {
    if (!data) return null;
    return 4 * ((data as string).length / 3);
    //4*(n/3) = Bytes (where n is num of base64 chars)
    //example: hello world =>  aGVsbG8gd29ybGQ=
  }

  static convertToBase64(binaryStr: ImageData): string {
    return enc.Base64.stringify(binaryStr);
  }

  static convertToValidBase64Data(
    data: string,
    imageType?: IImageType
  ): string {
    let base64Data = data;
    //Check using Regex Provided Base64 Encoded String
    //Get Only 30 chars from the base64 encoded string since it's usally too long (for performance reasons)
    if (!ImageReader.validBase64Regex.test(data.substr(0, 30))) {
      base64Data =
        `data:${
          imageType ? ImageReader.convertTypeToStr(imageType) : "image/png"
        };base64, ` + data;
    }
    return base64Data;
  }

  static createFromURL(URL: string, width?: number, height?: number): IImage {
    return {
      name: ImageReader.getImageNameFromURL(URL),
      type: IImageType.PNG,
      URL: URL,
      width,
      height
    };
  }

  /**
   * Tries to get the name of the image from a provided URL(Link)
   * It simply tries to get characters after the last slash
   * And appends the current Date DD-MM-YY
   * @param URL
   */
  static getImageNameFromURL(URL: string): string {
    const currentDate: Date = new Date();
    const currentDateStr =
      currentDate.getDate() +
      "-" +
      (currentDate.getMonth() + 1) +
      "-" +
      currentDate.getFullYear() +
      "_" +
      currentDate.getHours() +
      ":" +
      currentDate.getMinutes();
    if (!URL || URL === "") return currentDateStr;
    //Get last text after last URL forward slash
    const name = URL.substr(URL.lastIndexOf("/") + 1);
    return name + " " + currentDate;
  }

  getBinaryData(): string {
    return enc.Base64.stringify(this.data as string);
  }

  getImage(): IImage {
    return {
      name: this.name,
      size: this.size,
      type: this.type,
      data: this.data
    };
  }

  /**
   * Reads an Image From Remote URL (Returns a promise handles Image Instance and Saves One on the Current Class Instance).
   * Use this if not used constructor
   * NOTE: only for Allowed CORS Domains, please use readFromURLCORS if want to spoof CORS
   * @param url
   */
  readFromURL(
    url: string,
    width?: number | string,
    height?: number | string,
    name?: string
  ): Promise<IImage> {
    return new Promise((rs, rj) => {
      //Check & Convert width and height
      if (width && typeof width == "string")
        width = parseInt(width.replace("px", ""));
      if (height && typeof height == "string")
        height = parseInt(height.replace("px", ""));
      let img = new Image();
      //Cross-Domain Remote Image Fetching
      img.crossOrigin = "Use-Credentials";
      //Set Image URL
      img.src = url;
      //USE CANVAS FOR Image reading and encoding
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      //Wait for image to load
      img.onload = () => {
        //Set canvas size
        canvas.width = width ? (width as number) : img.width;
        canvas.height = height ? (height as number) : img.height;
        //Draw Image on the canvas (Fake)
        ctx.drawImage(img, 0, 0);
        //Get base64 encoded image data (draw image)
        let imgData = canvas.toDataURL("image/png");
        //Construct Image
        this.name = name
          ? name
          : "image-png-" + new Date().toDateString().replace(" ", "-");
        this.data = imgData;
        this.size = ImageReader.getDataSize(this.data);
        this.type = ImageReader.convertStrToType("image/png");
        this.isLoading = false;
        this.width = canvas.width;
        this.height = canvas.height;
        //Promise Resolve
        return rs({
          name: this.name,
          size: this.size,
          type: this.type,
          data: this.data,
          isLoading: this.isLoading,
          width: this.width,
          height: this.height
        } as IImage);
      };
      //Error && Abort
      img.onabort = img.onerror = () => {
        return rj(`ERROR! Image Cannot Loaded From Remote URL: ${url}`);
      };
    });
  }

  b64EncodeUnicode(str: string) {
    // first we use encodeURIComponent to get percent-encoded UTF-8,
    // then we convert the percent encodings into raw bytes which
    // can be fed into btoa.
    return btoa(
      encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function toSolidBytes(
        match,
        p1
      ) {
        return String.fromCharCode(("0x" + p1) as any);
      })
    );
  }

  /**
   * Reads an Image From Remote URL (Returns a promise handles Image Instance and Saves One on the Current Class Instance).
   * Use this if not used constructor
   * NOTE: (DEFAULT) Use this if you want to grab images from Blocked CORS (Not Allowed) Remote Server TODO: MAKE RELIABLE SERVER FOR THIS
   * @param url
   * @param width
   * @param height
   * @param name
   */
  readFromURLCORS(
    url: string,
    width?: number | string,
    height?: number | string,
    name?: string
  ): Promise<IImage> {
    return new Promise<IImage>((rs, rj) => {
      //Validate URL
      if (!validateURL(url)) return rj("Please choose a Valid URL!");
      //Validate img Width and Height
      if (width && typeof width == "string")
        width = parseInt(width.replace("px", "")) as number;
      if (height && typeof height == "string")
        height = parseInt(height.replace("px", "")) as number;
      //TODO: Create a More reliable and faster server for taking care of making CORS escape requests (THE CURRENT HEROKUAPP IS TEMPORAY)
      //Alternative Cors-Escape Server: https://cors-anywhere.herokuapp.com/
      const CORS_ESCAPE = "https://ip-cors-escape.herokuapp.com/";
      //Fetch image from URL (Set Content-Type for End-Point to know what to return)
      axios
        .get(CORS_ESCAPE + url, {
          headers: { "Request-Content-Type": "image" }
        })
        .then(res => {
          //OUR Custom Cors-Escape Will Automatically do the encoding and return an base64 encoded image
          this.data = res.data;
          console.log("DATA: ", this.data);
          //Generate a temp name
          this.name = name
            ? name
            : "image-png-" + new Date().toDateString().replace(" ", "-");
          this.size = ImageReader.getDataSize(this.data);
          //GET Type from header otherwise choose PNG by default
          this.type = res.headers["content-type"]
            ? ImageReader.convertStrToType(res.headers["content-type"])
            : IImageType.PNG;
          //Image Width and Height needed for Editor Decorator Proper Rendering
          this.width = width as number;
          this.height = height as number;
          //Construct an Image (and resolve what promised :)
          return rs({
            name: this.name,
            size: this.size,
            type: this.type,
            data: this.data,
            width: this.width,
            height: this.height
          });
        })
        .catch(err => {
          //Error, Reject
          return rj(`Error! ${err.message as string}`);
        });
    });
  }

  /**
   * Reads an Image from File (local computer storage) => (Returns a promise handles Image Instance and Saves One on the Current Class Instance).
   * Use this if not used constructor
   * @param file
   */
  readFromFile(file: File): Promise<IImage> {
    //TODO: Implement File Image Reading using FileReader
    return new Promise((rs, rj) => {});
  }
}
