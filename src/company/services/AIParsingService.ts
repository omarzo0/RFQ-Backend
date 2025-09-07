import { PrismaClient } from "@prisma/client";
import logger from "../../utils/logger";
import OpenAI from "openai";
import * as cheerio from "cheerio";

export interface ParsingResult {
  parsingType: string;
  extractedData: any;
  confidenceScore: number;
  rawText?: string;
  processedText?: string;
}

export interface PriceExtractionResult {
  oceanFreight?: number;
  baf?: number;
  caf?: number;
  securityFee?: number;
  documentationFee?: number;
  handlingCharges?: number;
  otherCharges?: any;
  totalAmount?: number;
  currency?: string;
  confidenceScore: number;
}

export interface TermsExtractionResult {
  validityDate?: Date;
  paymentTerms?: string;
  transitTime?: string;
  freeTimeAtOrigin?: number;
  freeTimeAtDestination?: number;
  termsAndConditions?: string;
  specialNotes?: string;
  confidenceScore: number;
}

export interface CurrencyConversionResult {
  originalCurrency: string;
  targetCurrency: string;
  originalAmount: number;
  convertedAmount: number;
  exchangeRate: number;
  confidenceScore: number;
}

export class AIParsingService {
  private prisma: PrismaClient;
  private openai: OpenAI | null = null;

  constructor() {
    this.prisma = new PrismaClient();

    // Initialize OpenAI if API key is available
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }
  }

  /**
   * Parse email content using AI
   */
  async parseEmailContent(emailReply: any): Promise<ParsingResult[]> {
    try {
      logger.info(`Parsing email content for ${emailReply.messageId}`);

      const results: ParsingResult[] = [];
      const content = this.extractTextContent(emailReply);

      if (!content || content.trim().length === 0) {
        logger.warn(`No content found in email ${emailReply.messageId}`);
        return results;
      }

      // Parse prices
      const priceResult = await this.extractPrices(content);
      if (priceResult) {
        results.push({
          parsingType: "PRICE_EXTRACTION",
          extractedData: priceResult,
          confidenceScore: priceResult.confidenceScore,
          rawText: content,
          processedText: this.cleanTextForParsing(content),
        });
      }

      // Parse terms
      const termsResult = await this.extractTerms(content);
      if (termsResult) {
        results.push({
          parsingType: "TERMS_EXTRACTION",
          extractedData: termsResult,
          confidenceScore: termsResult.confidenceScore,
          rawText: content,
          processedText: this.cleanTextForParsing(content),
        });
      }

      // Parse currency information
      const currencyResult = await this.extractCurrencyInfo(content);
      if (currencyResult) {
        results.push({
          parsingType: "CURRENCY_DETECTION",
          extractedData: currencyResult,
          confidenceScore: currencyResult.confidenceScore,
          rawText: content,
          processedText: this.cleanTextForParsing(content),
        });
      }

      // Store parsing results in database
      for (const result of results) {
        await this.storeParsingResult(emailReply.id, result);
      }

      // Log AI processing
      await this.logAIProcessing(
        emailReply.companyId,
        emailReply.id,
        "EMAIL_PARSING",
        {
          content: content.substring(0, 1000), // Limit content size
        },
        results,
        this.calculateAverageConfidence(results)
      );

      logger.info(
        `Successfully parsed email ${emailReply.messageId} with ${results.length} results`
      );

      return results;
    } catch (error) {
      logger.error(`Error parsing email content:`, error);
      throw error;
    }
  }

  /**
   * Extract text content from email
   */
  private extractTextContent(emailReply: any): string {
    let content = "";

    // Prefer plain text over HTML
    if (emailReply.bodyText) {
      content = emailReply.bodyText;
    } else if (emailReply.bodyHtml) {
      // Extract text from HTML
      const $ = cheerio.load(emailReply.bodyHtml);
      content = $.text();
    }

    return content;
  }

  /**
   * Clean text for parsing
   */
  private cleanTextForParsing(text: string): string {
    return text
      .replace(/\s+/g, " ")
      .replace(/[^\w\s.,$€£¥₹₽₩₪₦₡₨₴₸₼₾₿]/g, "")
      .trim();
  }

  /**
   * Extract pricing information using AI
   */
  async extractPrices(content: string): Promise<PriceExtractionResult | null> {
    try {
      if (this.openai) {
        return await this.extractPricesWithAI(content);
      } else {
        return await this.extractPricesWithRegex(content);
      }
    } catch (error) {
      logger.error("Error extracting prices:", error);
      return null;
    }
  }

  /**
   * Extract prices using OpenAI
   */
  private async extractPricesWithAI(
    content: string
  ): Promise<PriceExtractionResult | null> {
    try {
      const prompt = `
Extract shipping quote pricing information from the following email content. Return a JSON object with the following structure:
{
  "oceanFreight": number or null,
  "baf": number or null,
  "caf": number or null,
  "securityFee": number or null,
  "documentationFee": number or null,
  "handlingCharges": number or null,
  "otherCharges": object or null,
  "totalAmount": number or null,
  "currency": string or null,
  "confidenceScore": number between 0 and 1
}

Email content:
${content.substring(0, 2000)}

Only return the JSON object, no other text.`;

      const response = await this.openai!.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are an expert at extracting shipping quote information from emails. Return only valid JSON.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.1,
        max_tokens: 500,
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      return result;
    } catch (error) {
      logger.error("Error in AI price extraction:", error);
      return null;
    }
  }

  /**
   * Extract prices using regex patterns
   */
  private async extractPricesWithRegex(
    content: string
  ): Promise<PriceExtractionResult | null> {
    const result: PriceExtractionResult = {
      confidenceScore: 0,
    };

    // Currency detection
    const currencyMatch = content.match(
      /(USD|EUR|GBP|JPY|INR|RUB|KRW|ILS|NGN|CRC|PKR|UAH|KZT|AMD|BTC)/i
    );
    if (currencyMatch) {
      result.currency = currencyMatch[1].toUpperCase();
      result.confidenceScore += 0.2;
    }

    // Price patterns
    const pricePatterns = [
      {
        key: "oceanFreight",
        patterns: [
          /ocean\s*freight[:\s]*\$?([\d,]+\.?\d*)/i,
          /freight[:\s]*\$?([\d,]+\.?\d*)/i,
        ],
      },
      {
        key: "baf",
        patterns: [
          /baf[:\s]*\$?([\d,]+\.?\d*)/i,
          /bunker\s*adjustment[:\s]*\$?([\d,]+\.?\d*)/i,
        ],
      },
      {
        key: "caf",
        patterns: [
          /caf[:\s]*\$?([\d,]+\.?\d*)/i,
          /currency\s*adjustment[:\s]*\$?([\d,]+\.?\d*)/i,
        ],
      },
      {
        key: "securityFee",
        patterns: [
          /security[:\s]*\$?([\d,]+\.?\d*)/i,
          /isf[:\s]*\$?([\d,]+\.?\d*)/i,
        ],
      },
      {
        key: "documentationFee",
        patterns: [
          /documentation[:\s]*\$?([\d,]+\.?\d*)/i,
          /doc\s*fee[:\s]*\$?([\d,]+\.?\d*)/i,
        ],
      },
      {
        key: "handlingCharges",
        patterns: [
          /handling[:\s]*\$?([\d,]+\.?\d*)/i,
          /thc[:\s]*\$?([\d,]+\.?\d*)/i,
        ],
      },
      {
        key: "totalAmount",
        patterns: [
          /total[:\s]*\$?([\d,]+\.?\d*)/i,
          /grand\s*total[:\s]*\$?([\d,]+\.?\d*)/i,
        ],
      },
    ];

    for (const { key, patterns } of pricePatterns) {
      for (const pattern of patterns) {
        const match = content.match(pattern);
        if (match) {
          const value = parseFloat(match[1].replace(/,/g, ""));
          if (!isNaN(value)) {
            (result as any)[key] = value;
            result.confidenceScore += 0.1;
            break;
          }
        }
      }
    }

    // If we found at least one price, return the result
    if (result.confidenceScore > 0) {
      result.confidenceScore = Math.min(result.confidenceScore, 0.8); // Cap at 0.8 for regex
      return result;
    }

    return null;
  }

  /**
   * Extract terms and conditions
   */
  async extractTerms(content: string): Promise<TermsExtractionResult | null> {
    try {
      if (this.openai) {
        return await this.extractTermsWithAI(content);
      } else {
        return await this.extractTermsWithRegex(content);
      }
    } catch (error) {
      logger.error("Error extracting terms:", error);
      return null;
    }
  }

  /**
   * Extract terms using OpenAI
   */
  private async extractTermsWithAI(
    content: string
  ): Promise<TermsExtractionResult | null> {
    try {
      const prompt = `
Extract shipping terms and conditions from the following email content. Return a JSON object with the following structure:
{
  "validityDate": "YYYY-MM-DD" or null,
  "paymentTerms": string or null,
  "transitTime": string or null,
  "freeTimeAtOrigin": number or null,
  "freeTimeAtDestination": number or null,
  "termsAndConditions": string or null,
  "specialNotes": string or null,
  "confidenceScore": number between 0 and 1
}

Email content:
${content.substring(0, 2000)}

Only return the JSON object, no other text.`;

      const response = await this.openai!.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are an expert at extracting shipping terms from emails. Return only valid JSON.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.1,
        max_tokens: 500,
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");

      // Parse validity date
      if (result.validityDate) {
        result.validityDate = new Date(result.validityDate);
      }

      return result;
    } catch (error) {
      logger.error("Error in AI terms extraction:", error);
      return null;
    }
  }

  /**
   * Extract terms using regex patterns
   */
  private async extractTermsWithRegex(
    content: string
  ): Promise<TermsExtractionResult | null> {
    const result: TermsExtractionResult = {
      confidenceScore: 0,
    };

    // Validity date patterns
    const validityPatterns = [
      /valid[:\s]*until[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
      /validity[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
      /expires[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
    ];

    for (const pattern of validityPatterns) {
      const match = content.match(pattern);
      if (match) {
        try {
          result.validityDate = new Date(match[1]);
          result.confidenceScore += 0.2;
          break;
        } catch (error) {
          // Invalid date format
        }
      }
    }

    // Payment terms patterns
    const paymentPatterns = [
      /payment[:\s]*([^.\n]+)/i,
      /terms[:\s]*([^.\n]+)/i,
    ];

    for (const pattern of paymentPatterns) {
      const match = content.match(pattern);
      if (match) {
        result.paymentTerms = match[1].trim();
        result.confidenceScore += 0.15;
        break;
      }
    }

    // Transit time patterns
    const transitPatterns = [
      /transit[:\s]*([^.\n]+)/i,
      /delivery[:\s]*([^.\n]+)/i,
    ];

    for (const pattern of transitPatterns) {
      const match = content.match(pattern);
      if (match) {
        result.transitTime = match[1].trim();
        result.confidenceScore += 0.15;
        break;
      }
    }

    // Free time patterns
    const freeTimePatterns = [
      /free\s*time[:\s]*(\d+)\s*days/i,
      /demurrage[:\s]*(\d+)\s*days/i,
    ];

    for (const pattern of freeTimePatterns) {
      const match = content.match(pattern);
      if (match) {
        const days = parseInt(match[1]);
        if (!isNaN(days)) {
          result.freeTimeAtOrigin = days;
          result.freeTimeAtDestination = days;
          result.confidenceScore += 0.1;
          break;
        }
      }
    }

    if (result.confidenceScore > 0) {
      result.confidenceScore = Math.min(result.confidenceScore, 0.7); // Cap at 0.7 for regex
      return result;
    }

    return null;
  }

  /**
   * Extract currency information
   */
  async extractCurrencyInfo(
    content: string
  ): Promise<CurrencyConversionResult | null> {
    try {
      const currencies = [
        "USD",
        "EUR",
        "GBP",
        "JPY",
        "INR",
        "RUB",
        "KRW",
        "ILS",
        "NGN",
        "CRC",
        "PKR",
        "UAH",
        "KZT",
        "AMD",
      ];
      const currencySymbols = [
        "$",
        "€",
        "£",
        "¥",
        "₹",
        "₽",
        "₩",
        "₪",
        "₦",
        "₡",
        "₨",
        "₴",
        "₸",
        "₼",
        "₾",
        "₿",
      ];

      const foundCurrencies: string[] = [];

      // Find currency codes
      for (const currency of currencies) {
        if (content.toUpperCase().includes(currency)) {
          foundCurrencies.push(currency);
        }
      }

      // Find currency symbols
      for (const symbol of currencySymbols) {
        if (content.includes(symbol)) {
          // Map symbol to currency code
          const symbolMap: { [key: string]: string } = {
            $: "USD",
            "€": "EUR",
            "£": "GBP",
            "¥": "JPY",
            "₹": "INR",
            "₽": "RUB",
            "₩": "KRW",
            "₪": "ILS",
            "₦": "NGN",
            "₡": "CRC",
            "₨": "PKR",
            "₴": "UAH",
            "₸": "KZT",
            "₼": "AMD",
          };

          if (
            symbolMap[symbol] &&
            !foundCurrencies.includes(symbolMap[symbol])
          ) {
            foundCurrencies.push(symbolMap[symbol]);
          }
        }
      }

      if (foundCurrencies.length > 0) {
        return {
          originalCurrency: foundCurrencies[0],
          targetCurrency: "USD", // Default target
          originalAmount: 0,
          convertedAmount: 0,
          exchangeRate: 1,
          confidenceScore: 0.8,
        };
      }

      return null;
    } catch (error) {
      logger.error("Error extracting currency info:", error);
      return null;
    }
  }

  /**
   * Convert currency using external API
   */
  async convertCurrency(
    from: string,
    to: string,
    amount: number
  ): Promise<CurrencyConversionResult | null> {
    try {
      // This would typically use a currency conversion API
      // For now, we'll use a mock conversion
      const mockRates: { [key: string]: number } = {
        USD: 1,
        EUR: 0.85,
        GBP: 0.73,
        JPY: 110,
        INR: 75,
        RUB: 75,
        KRW: 1200,
        ILS: 3.2,
        NGN: 410,
        CRC: 620,
        PKR: 160,
        UAH: 27,
        KZT: 425,
        AMD: 520,
      };

      const fromRate = mockRates[from.toUpperCase()] || 1;
      const toRate = mockRates[to.toUpperCase()] || 1;
      const exchangeRate = toRate / fromRate;
      const convertedAmount = amount * exchangeRate;

      return {
        originalCurrency: from.toUpperCase(),
        targetCurrency: to.toUpperCase(),
        originalAmount: amount,
        convertedAmount: convertedAmount,
        exchangeRate: exchangeRate,
        confidenceScore: 0.9,
      };
    } catch (error) {
      logger.error("Error converting currency:", error);
      return null;
    }
  }

  /**
   * Store parsing result in database
   */
  private async storeParsingResult(
    emailReplyId: string,
    result: ParsingResult
  ): Promise<void> {
    try {
      await this.prisma.emailParsingResult.create({
        data: {
          emailReplyId: emailReplyId,
          parsingType: result.parsingType as any,
          extractedData: result.extractedData,
          confidenceScore: result.confidenceScore,
          rawText: result.rawText,
          processedText: result.processedText,
          validationStatus: "PENDING",
        },
      });
    } catch (error) {
      logger.error("Error storing parsing result:", error);
    }
  }

  /**
   * Log AI processing
   */
  private async logAIProcessing(
    companyId: string,
    emailReplyId: string,
    processingType: string,
    inputData: any,
    outputData: any,
    confidenceScore: number
  ): Promise<void> {
    try {
      await this.prisma.aIProcessingLog.create({
        data: {
          companyId: companyId,
          emailReplyId: emailReplyId,
          processingType: processingType as any,
          inputData: inputData,
          outputData: outputData,
          confidenceScore: confidenceScore,
          status: "COMPLETED",
          modelVersion: "gpt-3.5-turbo",
          processingTime: 0, // Would be calculated in real implementation
        },
      });
    } catch (error) {
      logger.error("Error logging AI processing:", error);
    }
  }

  /**
   * Calculate average confidence score
   */
  private calculateAverageConfidence(results: ParsingResult[]): number {
    if (results.length === 0) return 0;

    const total = results.reduce(
      (sum, result) => sum + result.confidenceScore,
      0
    );
    return total / results.length;
  }

  /**
   * Get parsing results for an email reply
   */
  async getParsingResults(emailReplyId: string): Promise<any[]> {
    return await this.prisma.emailParsingResult.findMany({
      where: { emailReplyId: emailReplyId },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Validate parsing result
   */
  async validateParsingResult(
    resultId: string,
    data: {
      validationStatus: "VALIDATED" | "REJECTED" | "FLAGGED";
      validationNotes?: string;
      validatedBy: string;
    }
  ): Promise<void> {
    await this.prisma.emailParsingResult.update({
      where: { id: resultId },
      data: {
        validationStatus: data.validationStatus as any,
        validationNotes: data.validationNotes,
        isValidated: true,
        validatedBy: data.validatedBy,
        validatedAt: new Date(),
      },
    });
  }

  /**
   * Get parsing statistics
   */
  async getParsingStats(companyId: string): Promise<{
    totalParsed: number;
    averageConfidence: number;
    validationRate: number;
    topParsingTypes: Array<{ type: string; count: number }>;
  }> {
    const [totalParsed, avgConfidence, validatedCount, parsingTypes] =
      await Promise.all([
        this.prisma.emailParsingResult.count({
          where: {
            emailReply: { companyId: companyId },
          },
        }),
        this.prisma.emailParsingResult.aggregate({
          where: {
            emailReply: { companyId: companyId },
          },
          _avg: { confidenceScore: true },
        }),
        this.prisma.emailParsingResult.count({
          where: {
            emailReply: { companyId: companyId },
            isValidated: true,
          },
        }),
        this.prisma.emailParsingResult.groupBy({
          by: ["parsingType"],
          where: {
            emailReply: { companyId: companyId },
          },
          _count: { parsingType: true },
        }),
      ]);

    return {
      totalParsed,
      averageConfidence: Number(avgConfidence._avg.confidenceScore) || 0,
      validationRate: totalParsed > 0 ? validatedCount / totalParsed : 0,
      topParsingTypes: parsingTypes.map((pt) => ({
        type: pt.parsingType,
        count: pt._count.parsingType,
      })),
    };
  }
}
