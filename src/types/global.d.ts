declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: unknown) => void;
          prompt: () => void;
          renderButton: (element: HTMLElement, config: unknown) => void;
        };
      };
    };
    AppleID: {
      auth: {
        init: (config: unknown) => void;
        signIn: () => Promise<unknown>;
      };
    };
  }
}

export {};
