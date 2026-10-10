import 'dart:async';
import 'package:decimal/decimal.dart';

class LocalAccountModel {
  final String id;
  final String orgId;
  final String name;
  final String type;
  final String? institutionName;
  final String? accountNumberMask;
  final String currency;
  final Decimal balance;
  final Decimal initialBalance;
  final String colorHex;
  final bool isArchived;
  final DateTime updatedAt;
  final String syncStatus;

  LocalAccountModel({
    required this.id,
    required this.orgId,
    required this.name,
    required this.type,
    this.institutionName,
    this.accountNumberMask,
    this.currency = 'PKR',
    required this.balance,
    required this.initialBalance,
    this.colorHex = '#059669',
    this.isArchived = false,
    required this.updatedAt,
    this.syncStatus = 'synced',
  });

  Map<String, dynamic> toMap() => {
    'id': id,
    'orgId': orgId,
    'name': name,
    'type': type,
    'institutionName': institutionName,
    'accountNumberMask': accountNumberMask,
    'currency': currency,
    'balance': balance.toString(),
    'initialBalance': initialBalance.toString(),
    'colorHex': colorHex,
    'isArchived': isArchived,
    'updatedAt': updatedAt.toIso8601String(),
    'syncStatus': syncStatus,
  };

  factory LocalAccountModel.fromMap(Map<String, dynamic> map) => LocalAccountModel(
    id: map['id'],
    orgId: map['orgId'],
    name: map['name'],
    type: map['type'],
    institutionName: map['institutionName'],
    accountNumberMask: map['accountNumberMask'],
    currency: map['currency'] ?? 'PKR',
    balance: Decimal.parse(map['balance'].toString()),
    initialBalance: Decimal.parse(map['initialBalance'].toString()),
    colorHex: map['colorHex'] ?? '#059669',
    isArchived: map['isArchived'] == true || map['isArchived'] == 1,
    updatedAt: DateTime.parse(map['updatedAt']),
    syncStatus: map['syncStatus'] ?? 'synced',
  );
}

abstract class IAccountDao {
  Future<List<LocalAccountModel>> getAllAccounts(String orgId);
  Stream<List<LocalAccountModel>> watchAccounts(String orgId);
  Future<LocalAccountModel?> getAccountById(String id);
  Future<void> insertAccount(LocalAccountModel account);
  Future<void> updateAccount(LocalAccountModel account);
  Future<void> updateAccountBalance(String id, Decimal newBalance);
  Future<void> archiveAccount(String id, bool isArchived);
}
