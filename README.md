# 구현 목록

- [x] thread crud 만들기
  - [x] thread 생성
  - [x] thread 조회
  - [x] thread 수정
  - [x] thread 삭제
- [x] postgresql 연동하기
- [x] 인증, 인가 구현하기
  1. 유저 service 구현 완료
  - [x] findOne
  - [x] create
  1. auth signin, signup 구현
  - [x] signup
    - [x] sign up 으로 username, password 받고
    - [x] password 를 해싱해서 user table 에 저장
  - [x] signin
    - [x] signin 시 유저 table의 password 로 검증하고
    - [x] jwt 로 반환 (refresh, access)
    - [x] http only 설정
  1. 인가 구현
  - [x] 쓰기
    - [x] auth guard 로 jwt 가 있는지 확인 후 수행
  - [x] 삭제,업데이트
    - [x] 인증 된 사용자만 수정 삭제 버튼 나타나게
    - [x] auth guard 로 jwt 키에서 userId를 추출해서,
          해당 유저인지 확인하고 맞으면 수행 아니면 401
- [ ] docker-compose로 postgresql, backend, frontend 연동하기
