import { Component, ComponentChild, h, RenderableProps } from "preact";
import WebsocketCollector from "../../WebsocketCollector";
import { MessageSender } from "../../MessageSender";
import { BackgroundCommunicator } from "../../BackgroundCommunicator";

type Props = {};

type State = {
  running: boolean;
  text: string;
};

export default class CollectDataButton extends Component<Props, State> {
  state = {
    running: false,
    text: "Collect data automatically",
  };

  onClicked() {
    if (this.state.running) {
      return;
    }

    const sender = new MessageSender();
    const communicator = new BackgroundCommunicator(sender);
    new WebsocketCollector(communicator, (message, done) => {
      this.setState(Object.assign({}, this.state, { text: message }));
      if (done) {
        this.setState(Object.assign({}, this.state, { text: "Collect data automatically", running: false }));
      }
    });
    this.setState(Object.assign({}, this.state, { running: true }));
  }

  render(props: RenderableProps<Props> | undefined, state: Readonly<State> | undefined, context: any): ComponentChild {
    return h("button", { className: "collect-data-btn btn-primary", onClick: () => this.onClicked() }, this.state.text);
  }
}
