import { AppDataSource } from '@config/database';
import { Quote } from '@entities/Quote';
import { NotFoundError, ValidationError, BadRequestError } from '@utils/errors';
import {
  generateId,
  generateQuoteNumber,
  getPaginationParams,
  calculateTotalPages,
} from '@utils/helpers';
import { QuoteStatus, PaginatedResponse } from '../types/index';

export class QuoteService {
  private quoteRepository = AppDataSource.getRepository(Quote);

  /**
   * Create a quote from a request
   */
  async createQuote(
    request_id: string,
    vendor_id: string,
    line_items: any[],
    total_amount: number,
    payment_terms?: string,
    delivery_location?: string,
    valid_days: number = 30
  ): Promise<Quote> {
    if (!request_id || !vendor_id || !line_items || line_items.length === 0) {
      throw new ValidationError(
        'Request ID, Vendor ID, and line items are required'
      );
    }

    const validity_date = new Date();
    validity_date.setDate(validity_date.getDate() + valid_days);

    const quote = this.quoteRepository.create({
      id: generateId(),
      quote_number: generateQuoteNumber(),
      request_id,
      vendor_id,
      quote_date: new Date(),
      validity_date,
      line_items,
      total_amount,
      payment_terms: payment_terms || 'NET 30',
      delivery_location: delivery_location || '',
      status: QuoteStatus.SENT,
    });

    await this.quoteRepository.save(quote);
    return quote;
  }

  /**
   * Get quote by ID
   */
  async getQuoteById(id: string): Promise<Quote> {
    const quote = await this.quoteRepository.findOne({
      where: { id },
    });

    if (!quote) {
      throw new NotFoundError('Quote', id);
    }

    return quote;
  }

  /**
   * Get quotes for a request
   */
  async getQuotesByRequest(
    request_id: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<PaginatedResponse<Quote>> {
    const { offset, limit } = getPaginationParams(page, pageSize);

    const [items, total] = await this.quoteRepository
      .createQueryBuilder('quote')
      .where('quote.request_id = :request_id', { request_id })
      .orderBy('quote.created_at', 'DESC')
      .skip(offset)
      .take(limit)
      .getManyAndCount();

    return {
      items,
      total,
      page,
      page_size: pageSize,
      total_pages: calculateTotalPages(total, pageSize),
    };
  }

  /**
   * Get all quotes with pagination
   */
  async getQuotes(options: {
    status?: QuoteStatus;
    vendor_id?: string;
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedResponse<Quote>> {
    const { status, vendor_id, page = 1, pageSize = 20 } = options;
    const { offset, limit } = getPaginationParams(page, pageSize);

    const query = this.quoteRepository.createQueryBuilder('quote');

    if (status) {
      query.andWhere('quote.status = :status', { status });
    }

    if (vendor_id) {
      query.andWhere('quote.vendor_id = :vendor_id', { vendor_id });
    }

    const [items, total] = await query
      .orderBy('quote.created_at', 'DESC')
      .skip(offset)
      .take(limit)
      .getManyAndCount();

    return {
      items,
      total,
      page,
      page_size: pageSize,
      total_pages: calculateTotalPages(total, pageSize),
    };
  }

  /**
   * Accept a quote
   */
  async acceptQuote(id: string): Promise<Quote> {
    const quote = await this.getQuoteById(id);

    if (quote.status !== QuoteStatus.RECEIVED) {
      throw new BadRequestError(
        'Can only accept quotes in RECEIVED status'
      );
    }

    quote.status = QuoteStatus.ACCEPTED;
    await this.quoteRepository.save(quote);
    return quote;
  }

  /**
   * Reject a quote
   */
  async rejectQuote(id: string, reason?: string): Promise<Quote> {
    const quote = await this.getQuoteById(id);

    if (![QuoteStatus.RECEIVED, QuoteStatus.ACCEPTED].includes(quote.status)) {
      throw new BadRequestError(
        'Can only reject quotes in RECEIVED or ACCEPTED status'
      );
    }

    quote.status = QuoteStatus.REJECTED;

    await this.quoteRepository.save(quote);
    return quote;
  }

  /**
   * Update quote status to RECEIVED when vendor submits
   */
  async markQuoteReceived(id: string): Promise<Quote> {
    const quote = await this.getQuoteById(id);

    if (quote.status !== QuoteStatus.SENT) {
      throw new BadRequestError(
        'Can only mark SENT quotes as RECEIVED'
      );
    }

    quote.status = QuoteStatus.RECEIVED;
    await this.quoteRepository.save(quote);
    return quote;
  }

  /**
   * Check if quote is expired
   */
  isQuoteExpired(quote: Quote): boolean {
    return new Date() > quote.validity_date;
  }

  /**
   * Get non-expired quotes for request
   */
  async getActiveQuotesForRequest(request_id: string): Promise<Quote[]> {
    const quotes = await this.quoteRepository.find({
      where: { request_id },
    });

    return quotes.filter((q) => !this.isQuoteExpired(q));
  }
}

export default new QuoteService();
