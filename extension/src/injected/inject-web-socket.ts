type InjectWebSocketListener = {
  didSend: (data: any, url: string) => void;
  didReceive: (message: any, url: string) => void;
  injected: () => void;
};

export default function injectWebSocket(listeners: InjectWebSocketListener) {
  const OriginalInstances = new Map();
  const OriginalWebSocket = window.WebSocket;

  function getOriginalInstanceProperty(replacedInstance: any, name: string, defaultValue: any): any {
    const original = OriginalInstances.get(replacedInstance);
    if (!original) {
      return defaultValue;
    }

    if (original instanceof OriginalWebSocket) {
      // @ts-ignore
      return original[name];
    }

    return original.properties.hasOwnProperty(name) ? original.properties[name] : defaultValue;
  }

  function setOriginalInstanceProperty(replacedInstance: any, name: string, value: any) {
    if (value instanceof Function) {
      value = value.bind(replacedInstance);
    }

    const original = OriginalInstances.get(replacedInstance);
    if (!original) {
      return;
    }

    if (original instanceof OriginalWebSocket) {
      // @ts-ignore
      original[name] = value;
      return;
    }
    original.properties[name] = value;
  }

  const Replaced = function (this: any, url: any, protocols: any) {
    const instance = new OriginalWebSocket(url, protocols);

    Object.defineProperties(this, {
      binaryType: {
        get: function () {
          return getOriginalInstanceProperty(this, "binaryType", "blob");
        },
        set: function (value) {
          setOriginalInstanceProperty(this, "binaryType", value);
        },
      },
      bufferedAmount: {
        get: function () {
          return getOriginalInstanceProperty(this, "bufferedAmount", 0);
        },
        set: function () {},
      },
      extensions: {
        get: function () {
          return getOriginalInstanceProperty(this, "extensions", "");
        },
        set: function () {},
      },
      onclose: {
        get: function () {
          return getOriginalInstanceProperty(this, "onclose", null);
        },
        set: function (value) {
          setOriginalInstanceProperty(this, "onclose", value);
        },
      },
      onerror: {
        get: function () {
          return getOriginalInstanceProperty(this, "onerror", null);
        },
        set: function (value) {
          setOriginalInstanceProperty(this, "onerror", value);
        },
      },
      onmessage: {
        get: function () {
          return getOriginalInstanceProperty(this, "onmessage", null);
        },
        set: function (value) {
          setOriginalInstanceProperty(this, "onmessage", value);
        },
      },
      onopen: {
        get: function () {
          return getOriginalInstanceProperty(this, "onopen", null);
        },
        set: function (value) {
          setOriginalInstanceProperty(this, "onopen", value);
        },
      },
      protocol: {
        get: function () {
          return getOriginalInstanceProperty(this, "protocol", "");
        },
        set: function () {},
      },
      readyState: {
        get: function () {
          return getOriginalInstanceProperty(this, "readyState", 0);
        },
        set: function () {},
      },
      url: {
        get: function () {
          return getOriginalInstanceProperty(this, "url", "");
        },
        set: function () {},
      },
    });

    OriginalInstances.set(this, instance);
    this.addEventListener("message", function (event: MessageEvent) {
      listeners.didReceive(event.data, instance.url);
    });
  };

  const EventTarget = window.EventTarget || Element;
  Replaced.prototype = Object.create(EventTarget.prototype, {
    CONNECTING: { value: 0 },
    OPEN: { value: 1 },
    CLOSING: { value: 2 },
    CLOSED: { value: 3 },
    addEventListener: {
      enumerable: true,
      value: function (type: any, listener: any, options: any) {
        const instance = OriginalInstances.get(this);
        if (instance) {
          instance.addEventListener(type, listener, options);
        }
      },
      writable: true,
    },
    close: {
      enumerable: true,
      value: function (code: any, reason: any) {
        const instance = OriginalInstances.get(this);
        if (instance) {
          instance.close(code, reason);
        }
      },
      writable: true,
    },
    removeEventListener: {
      enumerable: true,
      value: function (type: any, listener: any, options: any) {
        const instance = OriginalInstances.get(this);
        if (instance) {
          instance.removeEventListener(type, listener, options);
        }
      },
      writable: true,
    },
    send: {
      enumerable: true,
      value: function (data: any) {
        const instance = OriginalInstances.get(this);
        if (instance) {
          instance.send(data);
          listeners.didSend(data, instance.url);
        }
      },
      writable: true,
    },
  });

  Replaced.CONNECTING = 0;
  Replaced.OPEN = 1;
  Replaced.CLOSING = 2;
  Replaced.CLOSED = 3;
  // @ts-ignore
  window.WebSocket = Replaced;
  listeners.injected();
}
