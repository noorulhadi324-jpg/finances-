import 'package:decimal/decimal.dart';
import 'package:intl/intl.dart';

class CurrencyFormatter {
  static final Map<String, String> _currencySymbols = {
    'PKR': 'Rs. ',
    'USD': '\$',
    'EUR': '€',
    'GBP': '£',
    'AED': 'AED ',
    'SAR': 'SAR ',
  };

  /// Formats a Decimal value with exact thousand separators and fixed decimal places
  static String format(Decimal amount, {String currency = 'PKR', int decimalDigits = 2}) {
    final symbol = _currencySymbols[currency] ?? '$currency ';
    final doubleValue = amount.toDouble();
    final formatter = NumberFormat.currency(
      symbol: symbol,
      decimalDigits: decimalDigits,
    );
    return formatter.format(doubleValue);
  }

  /// Parses input string to Decimal without loss of binary floating precision
  static Decimal parse(String text) {
    final cleaned = text.replaceAll(',', '').replaceAll('Rs.', '').replaceAll('\$', '').trim();
    if (cleaned.isEmpty) return Decimal.zero;
    return Decimal.tryParse(cleaned) ?? Decimal.zero;
  }
}

class FinancialCalculator {
  /// Validates whether a double-entry journal entry is strictly balanced
  /// Sum of Debits must equal Sum of Credits exactly.
  static bool validateDoubleEntryBalance({
    required List<Decimal> debits,
    required List<Decimal> credits,
  }) {
    final totalDebits = debits.fold<Decimal>(Decimal.zero, (prev, curr) => prev + curr);
    final totalCredits = credits.fold<Decimal>(Decimal.zero, (prev, curr) => prev + curr);
    
    return totalDebits == totalCredits && totalDebits > Decimal.zero;
  }

  /// Calculates loan monthly installment using standard amortization formula
  /// M = P * [r(1+r)^n] / [(1+r)^n - 1]
  static Decimal calculateAmortization({
    required Decimal principal,
    required Decimal annualRatePct,
    required int termMonths,
  }) {
    if (termMonths <= 0) return Decimal.zero;
    if (annualRatePct <= Decimal.zero) {
      return (principal / Decimal.fromInt(termMonths)).toDecimal(scaleOnInfinitePrecision: 4);
    }

    final p = principal.toDouble();
    final r = (annualRatePct.toDouble() / 100.0) / 12.0;
    final n = termMonths;

    final numerator = p * (r * _pow(1 + r, n));
    final denominator = _pow(1 + r, n) - 1.0;
    final monthly = numerator / denominator;

    return Decimal.parse(monthly.toStringAsFixed(4));
  }

  /// Helper power function
  static double _pow(double base, int exponent) {
    double result = 1.0;
    for (int i = 0; i < exponent; i++) {
      result *= base;
    }
    return result;
  }

  /// Calculates percentage of budget utilized
  static double calculateBudgetUtilization({
    required Decimal allocated,
    required Decimal spent,
  }) {
    if (allocated <= Decimal.zero) return 0.0;
    final ratio = (spent / allocated).toDecimal(scaleOnInfinitePrecision: 4).toDouble();
    return ratio * 100.0;
  }
}
