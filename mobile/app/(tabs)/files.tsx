import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as FileSystem from 'expo-file-system';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CLARA } from '@/constants/theme';

type TreeNode = {
  name: string;
  children?: TreeNode[];
};

const MOCK_TREE: TreeNode = {
  name: 'clara-code',
  children: [
    {
      name: 'mobile',
      children: [
        { name: 'app', children: [{ name: '(tabs)' }, { name: '_layout.tsx' }] },
        { name: 'components', children: [{ name: 'VoiceMicButton.tsx' }] },
      ],
    },
    { name: 'package.json' },
  ],
};

function TreeRows({
  node,
  depth,
  onSelect,
  selectedPath,
  path,
}: {
  node: TreeNode;
  depth: number;
  onSelect: (p: string, name: string) => void;
  selectedPath: string | null;
  path: string;
}) {
  const [open, setOpen] = useState(depth < 2);
  const fullPath = path ? `${path}/${node.name}` : node.name;
  const hasKids = Boolean(node.children?.length);
  const isSelected = selectedPath === fullPath;

  return (
    <View>
      <Pressable
        onPress={() => {
          if (hasKids) setOpen((o) => !o);
          onSelect(fullPath, node.name);
        }}
        style={({ pressed }) => [
          styles.row,
          { paddingLeft: 12 + depth * 16 },
          isSelected && styles.rowSelected,
          pressed && styles.rowPressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel={`${hasKids ? 'Folder' : 'File'} ${node.name}`}
      >
        <FontAwesome
          name={hasKids ? (open ? 'folder-open' : 'folder') : 'file-o'}
          size={16}
          color={hasKids ? CLARA.accent : CLARA.textMuted}
          style={styles.rowIcon}
        />
        <Text style={styles.rowText} numberOfLines={1}>
          {node.name}
        </Text>
        {hasKids ? (
          <FontAwesome
            name={open ? 'chevron-down' : 'chevron-right'}
            size={12}
            color={CLARA.textMuted}
          />
        ) : null}
      </Pressable>
      {hasKids && open
        ? node.children!.map((child) => (
            <TreeRows
              key={`${fullPath}/${child.name}`}
              node={child}
              depth={depth + 1}
              onSelect={onSelect}
              selectedPath={selectedPath}
              path={fullPath}
            />
          ))
        : null}
    </View>
  );
}

export default function FilesScreen() {
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [summary, setSummary] = useState(
    'Select a file to see a stub summary. Workspace sync is not implemented yet.'
  );

  useEffect(() => {
    if (__DEV__) {
      // Dependency wired for Phase 3; sandbox listing is not used in the scaffold UI.
      console.log('[files] documentDirectory (stub):', FileSystem.documentDirectory);
    }
  }, []);

  const onSelect = useCallback((fullPath: string, name: string) => {
    setSelectedPath(fullPath);
    setSummary(
      `Clara summary (stub): "${name}" under ${fullPath} — connect the project service to replace this text with real analysis.`
    );
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Files</Text>
        <Text style={styles.subtitle}>Open project tree</Text>

        <View style={styles.treeCard}>
          <TreeRows
            node={MOCK_TREE}
            depth={0}
            onSelect={onSelect}
            selectedPath={selectedPath}
            path=""
          />
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Clara summary</Text>
          <Text style={styles.summaryBody}>{summary}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: CLARA.background },
  scroll: { paddingHorizontal: 20, paddingBottom: 32, gap: 16 },
  title: {
    marginTop: 8,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 28,
    color: CLARA.text,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: CLARA.textMuted,
  },
  treeCard: {
    borderRadius: 12,
    backgroundColor: CLARA.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: CLARA.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingRight: 12,
    gap: 8,
  },
  rowSelected: {
    backgroundColor: 'rgba(123, 200, 216, 0.08)',
  },
  rowPressed: {
    opacity: 0.92,
  },
  rowIcon: { width: 20 },
  rowText: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: CLARA.text,
  },
  summaryCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: CLARA.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: CLARA.border,
    gap: 8,
  },
  summaryTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: CLARA.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  summaryBody: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    lineHeight: 22,
    color: CLARA.text,
  },
});
