import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-4xl flex-col px-5 py-10 sm:px-6">
      <header className="flex items-center gap-2.5">
        <span className="flex size-9 items-center justify-center rounded-lg bg-teal-600 text-white">
          <svg
            viewBox="0 0 24 24"
            className="size-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 19V5m0 14h16M8 15l3-4 3 2 4-6"
            />
          </svg>
        </span>
        <span className="text-lg font-semibold tracking-tight text-zinc-900">
          데이터 분석 교실
        </span>
      </header>

      <div className="flex flex-1 flex-col justify-center py-12">
        <h1 className="max-w-[24ch] text-3xl font-semibold tracking-tight text-balance text-zinc-900 sm:text-4xl">
          데이터를 직접 정리하고, 그래프로 그리고, 분석해 보아요
        </h1>
        <p className="mt-4 max-w-[55ch] text-pretty text-base text-zinc-600">
          공공데이터를 내려받아 처리하는 복잡한 과정 없이, 브라우저에서 바로
          데이터를 전처리하고 시각화한 뒤 분석 결과를 제출할 수 있어요.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <Link
            href="/student"
            className="group rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
          >
            <span className="flex size-10 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
              <svg
                viewBox="0 0 24 24"
                className="size-6"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.6}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 14l9-5-9-5-9 5 9 5zm0 0v7m0-7l-6.5-3.6M12 14l6.5-3.6"
                />
              </svg>
            </span>
            <h2 className="mt-4 text-lg font-semibold tracking-tight text-zinc-900">
              학생으로 시작하기
            </h2>
            <p className="mt-1.5 text-sm text-zinc-600">
              반 코드와 이름을 입력하고 데이터 분석 과제를 진행해요.
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-teal-700">
              들어가기
              <svg
                viewBox="0 0 20 20"
                className="size-4 transition-transform group-hover:translate-x-0.5"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 5l5 5-5 5"
                />
              </svg>
            </span>
          </Link>

          <Link
            href="/teacher"
            className="group rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
          >
            <span className="flex size-10 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700">
              <svg
                viewBox="0 0 24 24"
                className="size-6"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.6}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m5 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </span>
            <h2 className="mt-4 text-lg font-semibold tracking-tight text-zinc-900">
              선생님으로 시작하기
            </h2>
            <p className="mt-1.5 text-sm text-zinc-600">
              제출물을 확인하고 채점하며, 수업용 데이터를 관리해요.
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-teal-700">
              관리자 로그인
              <svg
                viewBox="0 0 20 20"
                className="size-4 transition-transform group-hover:translate-x-0.5"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 5l5 5-5 5"
                />
              </svg>
            </span>
          </Link>
        </div>
      </div>

      <footer className="border-t border-black/5 pt-6 text-sm text-zinc-500">
        학생이 제출한 과제는 다른 학생에게 보이지 않으며, 선생님만 확인하고 채점할
        수 있습니다.
      </footer>
    </main>
  );
}
