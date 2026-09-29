/**
 * Cloudflare Pages 静态构建脚本。
 * 背景：静态导出（output: 'export'）不允许包含 /api 路由处理函数。
 * 做法：构建时把 src/app/api 暂时移出 app 目录，跑 `next build` 生成静态 out/，再移回原地，
 *       从而保留 /api/xii 供服务端部署（Vercel / 自托管）使用，两者互不冲突。
 */
import { execSync } from 'node:child_process';
import { existsSync, renameSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const apiDir = join(root, 'src', 'app', 'api');
// 必须放在 src/app 之外，否则 Next 仍会把它当作 app 路由扫描
const stashDir = join(root, 'src', '.api-stash');

function hasApi() {
  return existsSync(apiDir);
}

function moveToStash() {
  if (hasApi()) renameSync(apiDir, stashDir);
}

function restoreFromStash() {
  if (existsSync(stashDir)) renameSync(stashDir, apiDir);
}

// 关键：cleanup 即使构建失败也要恢复 api 目录
process.on('exit', restoreFromStash);

try {
  moveToStash();

  if (existsSync(join(root, 'out'))) {
    rmSync(join(root, 'out'), { recursive: true, force: true });
  }

  execSync('next build', {
    stdio: 'inherit',
    env: { ...process.env, NEXT_OUTPUT: 'export', NEXT_PUBLIC_STATIC: '1' },
    cwd: root,
  });

  restoreFromStash();
  console.log('\n✅ Cloudflare 静态导出完成 → out/');
} catch (err) {
  restoreFromStash();
  console.error('\n❌ Cloudflare 静态构建失败，已恢复 /api 目录。');
  process.exit(1);
}