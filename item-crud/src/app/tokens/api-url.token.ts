import { InjectionToken } from '@angular/core';

/**
 * Token que expõe a URL base da API utilizada pelos serviços HTTP.
 *
 * Mantém o serviço desacoplado de detalhes de infraestrutura,
 * permitindo substituição fácil em testes ou outros ambientes.
 */
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL'); 