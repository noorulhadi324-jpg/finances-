import 'dart:async';
import 'package:decimal/decimal.dart';

class LocalTransactionModel {
  final String id;
  final String orgId;
  final String accountId;
  final String? destinationAccountId;
  final String? categoryId;
  final String type; // income, expense, transfer
  final Decimal amount;
  final String currency;
  final Decimal exchangeRate;
  final Decimal baseCurrencyAmount;
  final DateTime transactionDate;
  final String? payeeOrPayer;
  final String? referenceNumber;
  final String? notes;
  final String status;
  final String? receiptUrl;
  final DateTime createdAt;
  final String syncStatus;

  LocalTransactionModel({
    required this.id,
    required this.orgId,
    required this.accountId,
    this.destinationAccountId,
    this.categoryId,
    required this.type,
    required this.amount,
    this.currency = 'PKR',
    Decimal? exchangeRate,
    required this.baseCurrencyAmount,
    required this.transactionDate,
    this.payeeOrPayer,
    this.referenceNumber,
    this.notes,
    this.status = 'cleared',
    this.receiptUrl,
    required this.createdAt,
    this.syncStatus = 'synced',
  }) : exchangeRate = exchangeRate ?? Decimal.one;

  Map<String, dynamic> toMap() => {
    'id': id,
    'orgId': orgId,
    'accountId': accountId,
    'destinationAccountId': destinationAccountId,
    'categoryId': categoryId,
    'type': type,
    'amount': amount.toString(),
    'currency': currency,
    'exchangeRate': exchangeRate.toString(),
    'baseCurrencyAmount': baseCurrencyAmount.toString(),
    'transactionDate': transactionDate.toIso8601String(),
    'payeeOrPayer': payeeOrPayer,
    'referenceNumber': referenceNumber,
    'notes': notes,
    'status': status,
    'receiptUrl': receiptUrl,
    'createdAt': createdAt.toIso8601String(),
    'syncStatus': syncStatus,
  };

  factory LocalTransactionModel.fromMap(Map<String, dynamic> map) => LocalTransactionModel(
    id: map['id'],
    orgId: map['orgId'],
    accountId: map['accountId'],
    destinationAccountId: map['destinationAccountId'],
    categoryId: map['categoryId'],
    type: map['type'],
    amount: Decimal.parse(map['amount'].toString()),
    currency: map['currency'] ?? 'PKR',
    exchangeRate: Decimal.parse(map['exchangeRate']?.toString() ?? '1.0'),
    baseCurrencyAmount: Decimal.parse(map['baseCurrencyAmount'].toString()),
    transactionDate: DateTime.parse(map['transactionDate']),
    payeeOrPayer: map['payeeOrPayer'],
    referenceNumber: map['referenceNumber'],
    notes: map['notes'],
    status: map['status'] ?? 'cleared',
    receiptUrl: map['receiptUrl'],
    createdAt: DateTime.parse(map['createdAt']),
    syncStatus: map['syncStatus'] ?? 'synced',
  );
}

abstract class ITransactionDao {
  Future<List<LocalTransactionModel>> getAllTransactions(String orgId, {int limit = 100, int offset = 0});
  Stream<List<LocalTransactionModel>> watchRecentTransactions(String orgId, {int limit = 20});
  Future<LocalTransactionModel?> getTransactionById(String id);
  Future<void> insertTransaction(LocalTransactionModel tx);
  Future<void> updateTransaction(LocalTransactionModel tx);
  Future<void> deleteTransaction(String id);
}
