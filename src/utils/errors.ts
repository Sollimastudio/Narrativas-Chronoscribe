export class BadRequestError extends Error {
  status = 400;
  details?: unknown;

  constructor(message: string, details?: unknown) {
    super(message);
    this.name = "BadRequestError";
    this.details = details;
  }
}

export class UnauthorizedError extends Error {
  status = 401;

  constructor(message = "Autenticação necessária.") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class PlanLimitError extends Error {
  status = 429;
  details?: unknown;

  constructor(message: string, details?: unknown) {
    super(message);
    this.name = "PlanLimitError";
    this.details = details;
  }
}

export class ProviderError extends Error {
  status = 502;
  provider: string;

  constructor(provider: string, message: string) {
    super(message);
    this.name = "ProviderError";
    this.provider = provider;
  }
}
