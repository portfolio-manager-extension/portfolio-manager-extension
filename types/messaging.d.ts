declare type ChromeTab = {
  status?: string | undefined;
  index: number;
  openerTabId?: number | undefined;
  title?: string | undefined;
  url?: string | undefined;
  pendingUrl?: string | undefined;
  pinned: boolean;
  highlighted: boolean;
  windowId: number;
  active: boolean;
  favIconUrl?: string | undefined;
  id?: number | undefined;
  incognito: boolean;
  selected: boolean;
  audible?: boolean | undefined;
  discarded: boolean;
  autoDiscardable: boolean;
  width?: number | undefined;
  height?: number | undefined;
  sessionId?: string | undefined;
  groupId: number;
};

declare type MessageSender = {
  id?: string | undefined;
  tab?: ChromeTab | undefined;
  nativeApplication?: string | undefined;
  frameId?: number | undefined;
  url?: string | undefined;
  tlsChannelId?: string | undefined;
  origin?: string | undefined;
};

declare interface IMessage<T extends string, P> {
  type: T;
  payload: P;
}

declare interface IMessageHandler<T extends string, P, R> {
  readonly type: T;

  execute(message: IMessage<T, P>, sender: MessageSender): Promise<R>;
}

interface IMessageSender {
  send(message: IMessage<any, any>): Promise<any>;
}

interface IMessageRouter {
  register(handler: IMessageHandler<any, any, any>): void;
}
