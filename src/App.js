import React from 'react';
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import './App.css';

class App extends React.Component {
  state = {
    croppedImages: [],
    src: require("./images/image.png"),
    crop: {
      unit: "%",
      x: 38,
      y: 30,
      width: 24,
      height: 30
    }
  };

  componentDidMount() {
    var imageloaded = localStorage.getItem("imageloaded");
    imageloaded && this.setState({ src: "data:image/png;base64," + imageloaded });
  }

  // If you setState the crop in here you should return false.
  onImageLoaded = (image) => {
    this.imageRef = image;
    localStorage.setItem("imageloaded", this.getBase64Image(image));
  };

  getBase64Image = (img) => {
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, img.width, img.height);

    var dataURL = canvas.toDataURL("image/png");

    return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
  }

  onCropComplete = (crop) => {
    this.makeClientCrop(crop);
  };

  onCropChange = (crop) => {
    this.setState({ crop });
  };

  addCroppedImage = (crop) => {
    // this.state.croppedImages.push(this.state.croppedImageUrl);
    this.setState({ croppedImages: this.state.croppedImages.concat(this.state.croppedImageUrl) });
    this.onCropComplete(crop);
  }
  removeCroppedImage = (i) => {
    this.setState({ croppedImages: this.state.croppedImages.filter((item, j) => i !== j) });
  }

  async makeClientCrop(crop) {
    if (this.imageRef && crop.width && crop.height) {
      const croppedImageUrl = await this.getCroppedImg(
        this.imageRef,
        crop,
        "newFile.jpeg"
      );
      this.setState({ croppedImageUrl });
    }
  }

  getCroppedImg(image, crop, fileName) {
    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext("2d");

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          //reject(new Error('Canvas is empty'));
          console.error("Canvas is empty");
          return;
        }
        blob.name = fileName;
        window.URL.revokeObjectURL(this.fileUrl);
        this.fileUrl = window.URL.createObjectURL(blob);
        resolve(this.fileUrl);
      }, "image/jpeg", 1);
    });
  }

  render() {
    const { src, crop, croppedImageUrl, croppedImages } = this.state;

    return (
      <div className="card">
        <div className="main_content">
          <ReactCrop
            src={src}
            crop={crop}
            onImageLoaded={this.onImageLoaded}
            onComplete={this.onCropComplete}
            onChange={this.onCropChange}
          />
        </div>
        <div className="side_content">
          <div className="add_button">
            <img alt="cropping" src={croppedImageUrl} />
            <button onClick={this.addCroppedImage}>
              <img alt="add" src={require("./images/add.png")} />
            </button>
          </div>
          {croppedImages.map((ci, i) => (
            <div key={i} className="row">
              <button onClick={() => this.removeCroppedImage(i)}>
                <img alt="cropped" src={ci} />
              </button>
              <h3>Shot {i + 1}</h3>
            </div>
          )).reverse()}
        </div>
      </div>
    );
  }
}

export default App;
