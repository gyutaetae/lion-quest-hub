# Lion Quest Hub

Supabase 기반 QR 출석 체크/포인트 관리 프로젝트입니다.

## 1) 로컬 실행

1. 의존성 설치
```bash
npm install
```

2. 환경변수 설정
```bash
cp .env.example .env.local
```

`.env.local`에 Supabase 프로젝트 값을 넣어주세요.

- `NEXT_PUBLIC_SUPABASE_URL`: `https://<project-ref>.supabase.co`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: Supabase `anon` key

3. 개발 서버 실행
```bash
npm run dev
```

## 2) Supabase DB 연동

이 저장소의 마이그레이션(`supabase/migrations`)에 출석 테이블/함수(`check_in_attendance`)가 포함되어 있습니다.

1. Supabase CLI 로그인
```bash
supabase login
```

2. 프로젝트 링크
```bash
supabase link --project-ref rwcvfkibnqeikqoaqvey
```

3. 마이그레이션 적용
```bash
supabase db push
```

## 3) 관리자 권한 부여 (QR 생성/출석 관리 탭용)

QR 생성과 출석 관리는 관리자 권한이 필요합니다.  
Supabase SQL Editor에서 아래를 실행하세요.

```sql
insert into public.user_roles (user_id, role)
values ('YOUR_AUTH_USER_UUID', 'admin')
on conflict (user_id, role) do nothing;
```

`YOUR_AUTH_USER_UUID`는 `auth.users`의 본인 UUID로 바꿔주세요.

## 4) 출석체크 사용 흐름

1. 관리자 계정으로 로그인
2. 대시보드 `QR 생성` 탭에서 모임 제목 + 유효시간으로 QR 생성
3. 참가자는 `출석체크` 탭에서 QR 스캔
4. 관리자는 같은 `QR 생성` 탭 오른쪽 `출석 현황`에서 실시간 명단 확인
