export async function copyToClipboard(dataToCopy: string) {
  await navigator.clipboard.write([
    new ClipboardItem({
      'text/html': new Blob([dataToCopy], { type: 'text/html' }),
      'text/plain': new Blob([dataToCopy], { type: 'text/plain' }),
    }),
  ]);
}

export function openSubstack(type: 'posts' | 'podcasts') {
  const url = `https://albumsweekly.substack.com/publish/post?type=${type === 'posts' ? 'newsletter' : 'podcast'}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}
