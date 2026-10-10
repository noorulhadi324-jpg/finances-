import 'package:decimal/decimal.dart';

enum TransactionType { income, expense, transfer }

class CreateTransactionParams {
  final String organizationId;
  final String accountId;
  final String? destinationAccountId;
  final String? categoryId;
  final TransactionType type;
  final Decimal amount;
  final String currency;
  final Decimal exchangeRate;
  final DateTime date;
  final String? notes;
  final String? payeeOrPayer;

  CreateTransactionParams({
    required this.organizationId,
    required this.accountId,
    this.destinationAccountId,
    this.categoryId,
    required this.type,
    required this.amount,
    this.currency = 'PKR',
    Decimal? exchangeRate,
    DateTime? date,
    this.notes,
    this.payeeOrPayer,
  })  : exchangeRate = exchangeRate ?? Decimal.one,
        date = date ?? DateTime.now();
}

class AccountBalanceReconciliation {
  /// Pure function calculating updated balances given transaction type and amount
  static Map<String, Decimal> calculateNewBalances({
    required TransactionType type,
    required Decimal sourceCurrentBalance,
    required Decimal amount,
    Decimal? destinationCurrentBalance,
  }) {
    if (amount <= Decimal.zero) {
      throw ArgumentError('Transaction amount must be strictly greater than zero.');
    }

    switch (type) {
      case TransactionType.income:
        return {'source': sourceCurrentBalance + amount};

      case TransactionType.expense:
        return {'source': sourceCurrentBalance - amount};

      case TransactionType.transfer:
        if (destinationCurrentBalance == null) {
          throw ArgumentError('Transfers require a valid destination account.');
        }
        return {
          'source': sourceCurrentBalance - amount,
          'destination': destinationCurrentBalance + amount,
        };
    }
  }
}
