import type { Language } from '@cote/db';

export interface LanguageSpec {
  /** 소스 파일 이름 (Java는 public class Main 고정) */
  sourceFile: string;
  /** 컴파일 명령. 없으면 인터프리터 언어 */
  compile?: string[];
  /** 실행 명령. {mem}은 메모리 제한(MB)으로 치환 */
  run: string[];
  /** docker 실행 모드에서 사용할 이미지 */
  image: string;
  /** 컴파일 언어는 시간·메모리 제한에 배수를 둔다 (JVM 기동 등) */
  timeFactor: number;
  memoryExtraMb: number;
  /** 로컬 모드에서 주소 공간 제한(prlimit --as)을 적용할지. JVM은 예약 메모리가 커서 제외 */
  addressSpaceLimit: boolean;
}

export const LANGUAGES: Record<Language, LanguageSpec> = {
  PYTHON: {
    sourceFile: 'main.py',
    run: ['python3', 'main.py'],
    image: 'python:3.11-alpine',
    timeFactor: 3,
    memoryExtraMb: 32,
    addressSpaceLimit: true,
  },
  JAVASCRIPT: {
    sourceFile: 'main.js',
    run: ['node', '--stack-size=65500', 'main.js'],
    image: 'node:22-alpine',
    timeFactor: 3,
    memoryExtraMb: 64,
    addressSpaceLimit: false, // V8 은 큰 가상 주소 공간을 예약한다
  },
  CPP: {
    sourceFile: 'main.cpp',
    compile: ['g++', '-O2', '-std=c++17', '-o', 'main', 'main.cpp'],
    run: ['./main'],
    image: 'gcc:13',
    timeFactor: 1,
    memoryExtraMb: 0,
    addressSpaceLimit: true,
  },
  JAVA: {
    sourceFile: 'Main.java',
    compile: ['javac', '-encoding', 'UTF-8', 'Main.java'],
    run: ['java', '-Xmx{mem}m', '-Xss64m', '-XX:+UseSerialGC', '-XX:TieredStopAtLevel=1', 'Main'],
    image: 'eclipse-temurin:21-jdk-alpine',
    timeFactor: 2,
    memoryExtraMb: 64,
    addressSpaceLimit: false,
  },
};

export function substituteMem(cmd: string[], memMb: number): string[] {
  return cmd.map((c) => c.replace('{mem}', String(memMb)));
}
