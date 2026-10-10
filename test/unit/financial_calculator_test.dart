import 'package:flutter_test/flutter_test.dart';
import 'package:decimal/decimal.dart';
import '../../lib/core/utils/financial_calculator.dart';
import '../../lib/features/transactions/domain/usecases/create_transaction_usecase.dart';

void main() {
  group('Financial Calculator & Double-Entry Tests', () {
    test('Strict double-entry balance validation succeeds when sum(debits) == sum(credits)', () {
      final debits = [
        Decimal.parse('50000.00'),
        Decimal.parse('15250.50'),
      ];
      final credits = [
        Decimal.parse('65250.50'),
      ];

      final isBalanced = FinancialCalculator.validateDoubleEntryBalance(
        debits: debits,
        credits: credits,
      );

      expect(isBalanced, isTrue);
    });

    test('Strict double-entry fails when debits and credits do not match', () {
      final debits = [Decimal.parse('1000.00')];
      final credits = [Decimal.parse('999.99')];

      final isBalanced = FinancialCalculator.validateDoubleEntryBalance(
        debits: debits,
        credits: credits,
      );

      expect(isBalanced, isFalse);
    });

    test('Budget utilization calculation accurately handles thresholds', () {
      final allocated = Decimal.parse('100000');
      final spent = Decimal.parse('85000');

      final pct = FinancialCalculator.calculateBudgetUtilization(
        allocated: allocated,
        spent: spent,
      );

      expect(pct, equals(85.0));
    });
  });

  group('Atomic Transaction Balance Reconciliation Rules', () {
    test('Income increases source balance without touching destination', () {
      final initial = Decimal.parse('1500000');
      final amount = Decimal.parse('650000');

      final result = AccountBalanceReconciliation.calculateNewBalances(
        type: TransactionType.income,
        sourceCurrentBalance: initial,
        amount: amount,
      );

      expect(result['source'], equals(Decimal.parse('2150000')));
    });

    test('Expense decreases source balance', () {
      final initial = Decimal.parse('2150000');
      final amount = Decimal.parse('380000');

      final result = AccountBalanceReconciliation.calculateNewBalances(
        type: TransactionType.expense,
        sourceCurrentBalance: initial,
        amount: amount,
      );

      expect(result['source'], equals(Decimal.parse('1770000')));
    });

    test('Transfer debits source and credits destination account atomically', () {
      final checkingInitial = Decimal.parse('2000000');
      final pettyCashInitial = Decimal.parse('50000');
      final transferAmount = Decimal.parse('35000');

      final result = AccountBalanceReconciliation.calculateNewBalances(
        type: TransactionType.transfer,
        sourceCurrentBalance: checkingInitial,
        destinationCurrentBalance: pettyCashInitial,
        amount: transferAmount,
      );

      expect(result['source'], equals(Decimal.parse('1965000')));
      expect(result['destination'], equals(Decimal.parse('85000')));
    });

    test('Throws exception if transaction amount is zero or negative', () {
      expect(
        () => AccountBalanceReconciliation.calculateNewBalances(
          type: TransactionType.income,
          sourceCurrentBalance: Decimal.parse('1000'),
          amount: Decimal.zero,
        ),
        throwsArgumentError,
      );
    });
  });
}
