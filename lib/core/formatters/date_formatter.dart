import 'package:intl/intl.dart';

class DateFormatter {
  static final DateFormat _isoDate = DateFormat('yyyy-MM-dd');
  static final DateFormat _displayDate = DateFormat('MMM d, yyyy');
  static final DateFormat _displayDateTime = DateFormat('MMM d, yyyy • h:mm a');

  static String toIso(DateTime date) => _isoDate.format(date);
  static String toDisplay(DateTime date) => _displayDate.format(date);
  static String toDisplayDateTime(DateTime date) => _displayDateTime.format(date);

  static DateTime parseIso(String text) {
    try {
      return _isoDate.parse(text);
    } catch (_) {
      return DateTime.now();
    }
  }
}
