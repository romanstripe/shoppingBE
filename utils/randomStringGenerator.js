const randomStringGenerator = () => {
  const randomString = Math.random().toString(36).substr(2, 11);
  // [출처] Node.JS - 난수를 이용한 랜덤 스트링 생성|작성자 예비개발자

  return randomString;
};

module.exports = randomStringGenerator;
