export class Optimizer {
  constructor(options = {}) {
    this.apiKey = options.apiKey ?? null;
  }

  optimize(text) {
    return {
      optimized: false,
      input: text,
      message: "Placeholder SDK package to reserve the npm name."
    };
  }
}
