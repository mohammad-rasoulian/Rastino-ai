# Rastino Student Books Manifest

نمونه:

{
  "source": "manual",
  "books": [
    {
      "file": "data/student-books/inbox/grade-12/math/math-3.pdf",
      "grade": 12,
      "track": "math",
      "subject": "ریاضی",
      "title": "ریاضی ۳",
      "edition": "۱۴۰۴",
      "sourceUrl": ""
    }
  ]
}

اجرا:

node scripts/import-student-books-batch.js --manifest data/student-books/manifests/grade-12-math.json
