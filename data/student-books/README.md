# فرمت ورود کتاب‌های درسی راستینو

برای هر کتاب یک فایل JSON بسازید:

data/student-books/grade-12/math-12.json

فرمت:

{
  "grade": 12,
  "subject": "ریاضی",
  "title": "ریاضی ۳",
  "edition": "۱۴۰۴",
  "sourceUrl": "https://chap.sch.ir/...",
  "pages": [
    {
      "page": 1,
      "chapter": "فصل اول",
      "section": "مقدمه",
      "content": "متن صفحه یا بخش..."
    }
  ]
}
