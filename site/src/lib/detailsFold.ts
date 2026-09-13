// 全站统一的折叠/展开动画（约定见 AGENTS.md §19）：
// 高度用 WAAPI（收起 230ms cubic-bezier(0.4, 0, 0.2, 1)，展开 260ms cubic-bezier(0.2, 0.6, 0.2, 1)），
// opacity 半程淡入淡出——收起时内容先淡出、横线不会拖到最后一刻；展开时先把内联高度钉为 0 再启动画，
// 避免 open 后内容以全高闪一帧。不用纯 CSS 的 ::details-content 过渡（展开方向依赖较新浏览器，行为不稳定）。
// prefers-reduced-motion 时无动画，状态变更同步生效。

export type FoldMode = 'expand' | 'collapse';

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// 对单个内容容器做收拢/展开动画；返回 Animation 供调用方在快速连点时取消。
// onDone 在动画正常结束时执行状态收尾（减少动态时无动画、onDone 立即同步执行）。
export function animateFold(content: HTMLElement, mode: FoldMode, onDone?: () => void): Animation | null {
  if (reduceMotion()) {
    onDone?.();
    return null;
  }
  const cs = getComputedStyle(content);
  const pt = cs.paddingTop;
  const pb = cs.paddingBottom;
  if (mode === 'collapse') {
    const h = content.offsetHeight;
    content.style.overflow = 'clip';
    const animCollapse = content.animate(
      [
        { height: `${h}px`, paddingTop: pt, paddingBottom: pb, opacity: '1' },
        { opacity: '0', offset: 0.55 },
        { height: '0px', paddingTop: '0px', paddingBottom: '0px', opacity: '0' },
      ],
      { duration: 230, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' }
    );
    animCollapse.onfinish = () => {
      content.removeAttribute('style');
      onDone?.();
    };
    return animCollapse;
  } else {
    const h = content.offsetHeight;
    content.style.overflow = 'clip';
    content.style.height = '0px';
    content.style.paddingTop = '0px';
    content.style.paddingBottom = '0px';
    const anim = content.animate(
      [
        { height: '0px', paddingTop: '0px', paddingBottom: '0px', opacity: '0' },
        { opacity: '1', offset: 0.5 },
        { height: `${h}px`, paddingTop: pt, paddingBottom: pb, opacity: '1' },
      ],
      { duration: 260, easing: 'cubic-bezier(0.2, 0.6, 0.2, 1)' }
    );
    anim.onfinish = () => {
      content.removeAttribute('style');
      onDone?.();
    };
    return anim;
  }
}

// 给 <details> 折叠组件接线：summary 点击改为动画驱动（覆盖原生即时开合）。
// 调用方需保证每个 details 内只有一个内容容器（summary 之外的唯一包裹元素）。
// 程序化设置 details.open（筛选联动、日历跳转等）不经过这里，保持即时——正确且必要。
export function attachFoldAnim(detailsSel: string, contentSel: string) {
  document.querySelectorAll<HTMLDetailsElement>(detailsSel).forEach((details) => {
    const summary = details.querySelector('summary');
    const content = details.querySelector<HTMLElement>(contentSel);
    if (!summary || !content) return;
    let anim: Animation | null = null;
    summary.addEventListener('click', (e) => {
      e.preventDefault();
      anim?.cancel();
      if (details.open) {
        anim = animateFold(content, 'collapse', () => {
          details.open = false;
        });
      } else {
        details.open = true;
        anim = animateFold(content, 'expand');
      }
    });
  });
}
