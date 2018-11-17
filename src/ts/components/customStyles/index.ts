//Font Sizes
let fontSizesStyle: any = [];
for (let i = 12; i < 43; i++) {
  fontSizesStyle[i] = {
    label: `${i}px`,
    type: `${i}`,
    customStyles: { fontSize: `${i}px` }
  };
}
export { fontSizesStyle };

//Load Fonts
import "../../../resources/fonts/Acme-Regular.ttf";
import "../../../resources/fonts/BalooTammudu-Regular.ttf";
import "../../../resources/fonts/BreeSerif-Regular.ttf";
import "../../../resources/fonts/Courgette-Regular.ttf";
import "../../../resources/fonts/GamjaFlower-Regular.ttf";
import "../../../resources/fonts/AdventPro-Regular.ttf";

//Font Families
const fonts = [
  { name: "Oxygen", style: "Oxygen, sans-serif" },
  { name: "Advent Pro", style: "Advent Pro, sans-serif" },
  { name: "Roboto", style: "Roboto, sans-serif" },
  { name: "Lato", style: "Lato, sans-serif" },
  { name: "Mukta", style: "Mukta, sans-serif" },
  { name: "Montserrat", style: "Montserrat, sans-serif" },
  { name: "Gamja Flower", style: "Gamja Flower, cursive" },
  { name: "Noto Sans", style: "Noto Sans, sans-serif" },
  { name: "Inconsolata", style: "Inconsolata, monospace" },
  { name: "Lobster", style: "Lobster, cursive" },
  { name: "Pacifico", style: "Pacifico, cursive" },
  { name: "Acme", style: "Acme, sans-serif" },
  { name: "Bree Serif", style: "Bree Serif, serif" },
  { name: "Gloria Hallelujah", style: "Gloria Hallelujah, cursive" },
  { name: "Righteous", style: "Righteous, cursive" },
  { name: "Maven Pro", style: "Maven Pro, sans-serif" },
  { name: "Permanent Marker", style: "Permanent Marker, cursive" },
  { name: "Courgette", style: "Courgette, cursive" }
];
//Generate FontFamillies Object
let fontFamiliesStyle: any = [];
for (const font of fonts) {
  fontFamiliesStyle.push({
    label: font.name,
    type: font.style,
    customStyles: { fontFamily: font.style }
  });
}
export { fontFamiliesStyle };
