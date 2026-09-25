/**
 * Monaco 를 CDN 이 아닌 번들에서 로드한다.
 * 문법 강조만 필요하므로 언어별 워커는 두지 않고 기본 에디터 워커만 등록한다.
 */
import { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';

if (typeof window !== 'undefined' && !window.MonacoEnvironment) {
  window.MonacoEnvironment = {
    getWorker: () => new Worker(new URL('monaco-editor/esm/vs/editor/editor.worker.js', import.meta.url)),
  };
  loader.config({ monaco });
}
