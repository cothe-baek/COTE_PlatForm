/** 루트 .env 와 앱 로컬 .env 를 모두 읽는다 (로컬 값이 우선). 다른 import 보다 먼저 실행되어야 한다. */
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
