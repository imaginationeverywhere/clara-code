import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { CLARA } from '@/constants/theme';

const KEYWORD = new Set([
  'import',
  'export',
  'from',
  'const',
  'let',
  'return',
  'async',
  'await',
  'type',
  'interface',
  'extends',
  'function',
  'if',
  'else',
  'new',
  'true',
  'false',
  'null',
  'undefined',
]);

type Piece = { text: string; kind: 'kw' | 'str' | 'comment' | 'plain' };

function tokenizeLine(line: string): Piece[] {
  const trimmed = line.trimStart();
  if (trimmed.startsWith('//')) {
    return [{ text: line, kind: 'comment' }];
  }

  const parts: Piece[] = [];
  const re = /(\s+)|("[^"]*")|('[^']*')|(`[^`]*`)|(\b\w+\b)|([{}();,=<>[\].]|\.{3})/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line)) !== null) {
    const token = m[0];
    if (m[1]) {
      parts.push({ text: token, kind: 'plain' });
    } else if (m[2] || m[3] || m[4]) {
      parts.push({ text: token, kind: 'str' });
    } else if (m[5]) {
      parts.push({ text: token, kind: KEYWORD.has(token) ? 'kw' : 'plain' });
    } else {
      parts.push({ text: token, kind: 'plain' });
    }
  }
  return parts.length > 0 ? parts : [{ text: line, kind: 'plain' }];
}

export function SyntaxBlock({ code }: { code: string }) {
  const lines = code.split('\n');

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.scrollInner}
    >
      <View>
        {lines.map((line, row) => (
          <View key={row} style={styles.lineRow}>
            <Text style={styles.gutter}>{String(row + 1).padStart(3, ' ')}</Text>
            <Text style={styles.code}>
              {tokenizeLine(line).map((t, i) => {
                const style =
                  t.kind === 'comment'
                    ? styles.comment
                    : t.kind === 'kw'
                      ? styles.keyword
                      : t.kind === 'str'
                        ? styles.string
                        : styles.plain;
                return (
                  <Text key={i} style={style}>
                    {t.text}
                  </Text>
                );
              })}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { maxHeight: 220 },
  scrollInner: { paddingVertical: 4 },
  lineRow: { flexDirection: 'row', alignItems: 'flex-start' },
  gutter: {
    paddingRight: 12,
    color: CLARA.textMuted,
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
  },
  code: {
    flexShrink: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 20,
  },
  plain: { color: CLARA.text },
  keyword: { color: '#79C0FF' },
  string: { color: '#A5D6FF' },
  comment: { color: '#8B949E', fontStyle: 'italic' },
});
