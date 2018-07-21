export interface ToolItem {
  [name : string] : string | boolean;
  active : boolean;
}

//ToolItems Default State
export let defaultToolItems = [
  {
    name: "BOLD",
    active: false
  }, {
    name: "italic",
    active: false
  }, {
    name: "underline",
    active: false
  }, {
    name: "alignLeft",
    active: false
  }, {
    name: "alignCenter",
    active: false
  }, {
    name: "alignRight",
    active: false
  }, {
    name: "alignJustify",
    active: false
  }
]