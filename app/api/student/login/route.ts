import { getSql } from "@/lib/db";
import { createSession } from "@/lib/session";
import { isClassCodeAllowed } from "@/lib/config";
import { jsonError, handleRouteError } from "@/lib/api-utils";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const classCode = String(body.classCode ?? "").trim();
    const studentNo = String(body.studentNo ?? "").trim();
    const name = String(body.name ?? "").trim();

    if (!classCode || !studentNo || !name) {
      return jsonError("반 코드, 번호, 이름을 모두 입력해주세요.");
    }
    if (name.length > 20 || studentNo.length > 10 || classCode.length > 20) {
      return jsonError("입력값이 너무 깁니다.");
    }
    if (!isClassCodeAllowed(classCode)) {
      return jsonError("올바르지 않은 반 코드입니다. 선생님께 확인해주세요.");
    }

    const sql = getSql();
    const rows = (await sql`
      INSERT INTO students (class_code, student_no, name)
      VALUES (${classCode}, ${studentNo}, ${name})
      ON CONFLICT (class_code, student_no)
      DO UPDATE SET name = EXCLUDED.name
      RETURNING id, class_code, student_no, name
    `) as {
      id: number;
      class_code: string;
      student_no: string;
      name: string;
    }[];

    const student = rows[0];
    await createSession({
      role: "student",
      studentId: student.id,
      classCode: student.class_code,
      studentNo: student.student_no,
      name: student.name,
    });

    return Response.json({
      ok: true,
      student: {
        name: student.name,
        studentNo: student.student_no,
        classCode: student.class_code,
      },
    });
  } catch (err) {
    return handleRouteError(err);
  }
}
