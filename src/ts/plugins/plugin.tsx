import * as React from "react";

export default class Plugin<P = {}, S = {}> extends React.Component<P, S> {
  constructor(props: P) {
    super(props);
  }
}
