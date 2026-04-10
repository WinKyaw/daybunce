import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  SafeAreaView,
  Alert,
  Animated,
  RefreshControl,
  ScrollView,
  Platform,
} from 'react-native';
import InsightEngine from '../services/InsightEngine';

const SEVERITY_ORDER = { critical: 0, warning: 1, info: 2 };

const SEVERITY_COLORS = {
  critical: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
};

const SEVERITY_BADGES = {
  critical: '🚨 Critical',
  warning: '⚠️ Warning',
  info: 'ℹ️ Info',
};

const FILTER_TABS = [
  { key: 'all', label: 'All' },
  { key: 'warning', label: '⚠️ Warnings' },
  { key: 'info', label: 'ℹ️ Info' },
  { key: 'critical', label: '🚨 Critical' },
];

// Format a relative time string: "2 hours ago", "3 days ago", etc.
function relativeTime(isoString) {
  try {
    const diff = Date.now() - new Date(isoString).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) { return 'Just now'; }
    if (mins < 60) { return `${mins} minute${mins === 1 ? '' : 's'} ago`; }
    const hours = Math.floor(mins / 60);
    if (hours < 24) { return `${hours} hour${hours === 1 ? '' : 's'} ago`; }
    const days = Math.floor(hours / 24);
    return `${days} day${days === 1 ? '' : 's'} ago`;
  } catch {
    return '';
  }
}

// ─── InsightCard ──────────────────────────────────────────────────────────────

const InsightCard = ({ insight, onDismiss, onAskAI }) => {
  const opacity = useRef(new Animated.Value(1)).current;
  const accentColor = SEVERITY_COLORS[insight.severity] || SEVERITY_COLORS.info;

  const handleDismiss = useCallback(() => {
    Animated.timing(opacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onDismiss(insight.id);
    });
  }, [insight.id, onDismiss, opacity]);

  return (
    <Animated.View style={[styles.card, { opacity }]}>
      {/* Left accent bar */}
      <View style={[styles.accentBar, { backgroundColor: accentColor }]} />

      <View style={styles.cardBody}>
        {/* Severity badge */}
        <View style={[styles.badge, { backgroundColor: `${accentColor}20` }]}>
          <Text style={[styles.badgeText, { color: accentColor }]}>
            {SEVERITY_BADGES[insight.severity] || insight.severity}
          </Text>
        </View>

        {/* Title */}
        <Text style={styles.cardTitle}>{insight.title}</Text>

        {/* Body */}
        <Text style={styles.cardBody2}>{insight.body}</Text>

        {/* Timestamp */}
        <Text style={styles.cardTimestamp}>
          Generated {relativeTime(insight.timestamp)}
        </Text>

        {/* Action buttons */}
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.askAIBtn]}
            onPress={() => onAskAI(insight)}
            activeOpacity={0.7}
          >
            <Text style={styles.askAIBtnText}>Ask AI →</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.dismissBtn]}
            onPress={handleDismiss}
            activeOpacity={0.7}
          >
            <Text style={styles.dismissBtnText}>Dismiss</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

// ─── InsightsDashboard ────────────────────────────────────────────────────────

const InsightsDashboard = ({ visible, onClose, onOpenAI }) => {
  const [insights, setInsights] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const loadInsights = useCallback(async () => {
    const loaded = await InsightEngine.loadInsights();
    setInsights(loaded);
  }, []);

  useEffect(() => {
    if (visible) {
      loadInsights();
    }
  }, [visible, loadInsights]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await InsightEngine.analyzeAndPersist();
      await loadInsights();
    } catch (e) {
      console.warn('InsightsDashboard refresh error', e);
    } finally {
      setRefreshing(false);
    }
  }, [loadInsights]);

  const handleDismiss = useCallback(async (id) => {
    await InsightEngine.dismissInsight(id);
    await loadInsights();
  }, [loadInsights]);

  const handleAskAI = useCallback((insight) => {
    if (onOpenAI) {
      onOpenAI(insight.suggestedQuestion);
    } else {
      Alert.alert(
        'Unlock AI Expert',
        'Unlock AI Expert to get personalised advice on this insight.',
      );
    }
  }, [onOpenAI]);

  // Sort and filter
  const displayedInsights = insights
    .filter(ins => !ins.dismissed)
    .filter(ins => activeFilter === 'all' || ins.severity === activeFilter)
    .sort((a, b) => {
      // undismissed first (already filtered), then by severity, then by recency
      const sev = (SEVERITY_ORDER[a.severity] ?? 3) - (SEVERITY_ORDER[b.severity] ?? 3);
      if (sev !== 0) { return sev; }
      return new Date(b.timestamp) - new Date(a.timestamp);
    });

  const renderInsight = useCallback(({ item }) => (
    <InsightCard
      key={item.id}
      insight={item}
      onDismiss={handleDismiss}
      onAskAI={handleAskAI}
    />
  ), [handleDismiss, handleAskAI]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.headerCloseBtn} activeOpacity={0.7}>
            <Text style={styles.headerCloseBtnText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>📊 Store Insights</Text>
          <TouchableOpacity
            onPress={handleRefresh}
            style={styles.headerRefreshBtn}
            activeOpacity={0.7}
          >
            <Text style={styles.headerRefreshBtnText}>🔄 Refresh</Text>
          </TouchableOpacity>
        </View>

        {/* Filter tabs */}
        <View style={styles.filterTabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterTabsContent}>
            {FILTER_TABS.map(tab => (
              <TouchableOpacity
                key={tab.key}
                style={[styles.filterTab, activeFilter === tab.key && styles.filterTabActive]}
                onPress={() => setActiveFilter(tab.key)}
                activeOpacity={0.7}
              >
                <Text style={[styles.filterTabText, activeFilter === tab.key && styles.filterTabTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Insights list */}
        <FlatList
          data={displayedInsights}
          keyExtractor={item => item.id}
          renderItem={renderInsight}
          contentContainerStyle={[
            styles.listContent,
            displayedInsights.length === 0 && styles.listContentEmpty,
          ]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>📭</Text>
              <Text style={styles.emptyStateText}>
                No insights yet. Keep adding sales data and check back soon.
              </Text>
            </View>
          }
        />
      </SafeAreaView>
    </Modal>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f4f6fb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerCloseBtn: {
    padding: 6,
    minWidth: 36,
    alignItems: 'center',
  },
  headerCloseBtnText: {
    fontSize: 18,
    color: '#6b7280',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a2e',
    flex: 1,
    textAlign: 'center',
  },
  headerRefreshBtn: {
    padding: 6,
    minWidth: 80,
    alignItems: 'flex-end',
  },
  headerRefreshBtnText: {
    fontSize: 14,
    color: '#4f46e5',
    fontWeight: '600',
  },
  filterTabsContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  filterTabsContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    flexDirection: 'row',
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
  },
  filterTabActive: {
    backgroundColor: '#4f46e5',
  },
  filterTabText: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  filterTabTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  listContentEmpty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 15,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 22,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  accentBar: {
    width: 4,
    flexShrink: 0,
  },
  cardBody: {
    flex: 1,
    padding: 14,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    marginBottom: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 6,
  },
  cardBody2: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    marginBottom: 6,
  },
  cardTimestamp: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 12,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: 'center',
  },
  askAIBtn: {
    backgroundColor: '#4f46e5',
  },
  askAIBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  dismissBtn: {
    backgroundColor: '#f3f4f6',
  },
  dismissBtnText: {
    color: '#6b7280',
    fontSize: 13,
    fontWeight: '500',
  },
});

export default InsightsDashboard;
