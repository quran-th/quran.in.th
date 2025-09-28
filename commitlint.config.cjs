module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',    // ฟีเจอร์ใหม่
        'fix',     // การแก้ไขบัก
        'docs',    // การเปลี่ยนแปลงเอกสาร
        'style',   // การเปลี่ยนแปลงที่ไม่มีผลต่อความหมายของโค้ด (เช่น whitespace, formatting)
        'refactor', // การรีแฟกเตอร์โค้ดที่ไม่ได้แก้ไขบัก หรือเพิ่มฟีเจอร์
        'perf',    // การเปลี่ยนแปลงโค้ดที่ปรับปรุงประสิทธิภาพ
        'test',    // การเพิ่มการทดสอบที่หายไป หรือแก้ไขการทดสอบที่มีอยู่
        'chore',   // การเปลี่ยนแปลงใน build process หรือ auxiliary tools และ libraries
        'ci',      // การเปลี่ยนแปลง CI configuration files และ scripts
        'build',   // การเปลี่ยนแปลงที่มีผลต่อ build system หรือ external dependencies
        'revert'   // การยกเลิกการเปลี่ยนแปลงก่อนหน้า
      ]
    ],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
    'scope-case': [2, 'always', 'lower-case'],
    'subject-case': [2, 'never', ['sentence-case', 'start-case', 'pascal-case', 'upper-case']],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 100],
    'body-leading-blank': [1, 'always'],
    'body-max-line-length': [2, 'always', 100],
    'footer-leading-blank': [1, 'always'],
    'footer-max-line-length': [2, 'always', 100]
  }
}