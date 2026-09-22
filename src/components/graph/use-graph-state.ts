'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getEmperor, getPost, princes } from '@/lib/data';
import { getPeriodById, locateEmperor, listPeriods, listSystems, type GraphLayer } from '@/lib/graph';
import { useIsDark } from '@/lib/use-is-dark';
import { useIsMobile } from '@/lib/use-is-mobile';
import type { System } from '@/types/index';
import {
  buildCrumbs,
  buildGraphForLayer,
  buildSuggestions,
  fallbackGroups,
  findPlaceholderFor,
  hintForLayer,
  layoutForLayer,
  legendForLayer,
  resolveHighlight,
  resolveLayer,
  toolbarTitle,
  toneForLayer,
  type Tab,
} from './graph-derive';
import type { G6CanvasHandle, NodeTone } from './g6-canvas';
import type { Crumb } from './graph-breadcrumb';
import type { ListGroup } from './graph-list-fallback';
import type { GraphSidePanelProps } from './graph-side-panel';
import type { FindOption } from './graph-toolbar';
import { createTones, type LegendItem } from './tones';

const MOBILE_LIMIT = 20;

export interface GraphState {
  tab: Tab;
  setTab: (tab: Tab) => void;
  layer: GraphLayer;
  isIndex: boolean;
  dark: boolean;
  crumbs: Crumb[];
  periodCards: ReturnType<typeof listPeriods>;
  systemCards: ReturnType<typeof listSystems>;
  tone: (node: Record<string, unknown>) => NodeTone;
  legend: LegendItem[];
  graph: ReturnType<typeof buildGraphForLayer>;
  layout: ReturnType<typeof layoutForLayer>;
  highlightIds?: string[];
  activeNodeId: string | null;
  useList: boolean;
  nodeCount: number;
  listGroups: ListGroup[];
  listCaption: string;
  immersive: boolean;
  onToggleImmersive: () => void;
  onToggleList: () => void;
  handleRef: React.MutableRefObject<G6CanvasHandle | null>;
  onSelect: (id: string) => void;
  onDrill: (id: string) => void;
  toolbarTitle: string;
  toolbarHint: string;
  findPlaceholder: string;
  suggestions: FindOption[];
  onFindPick: (id: string) => void;
  openPeriod: (periodId: string) => void;
  openSystem: (system: System) => void;
  panelProps: GraphSidePanelProps;
}

export function useGraphState({
  focusId,
  focusPost,
}: {
  focusId?: string;
  focusPost?: string;
}): GraphState {
  const dark = useIsDark();
  const mobile = useIsMobile();
  const router = useRouter();
  const tones = useMemo(() => createTones(dark), [dark]);
  const handleRef = useRef<G6CanvasHandle | null>(null);

  const [tab, setTab] = useState<Tab>('lineage');
  const [periodId, setPeriodId] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string[]>([]);
  const [fullExpand, setFullExpand] = useState<string[]>([]);
  const [system, setSystem] = useState<System | null>(null);
  const [org, setOrg] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [immersive, setImmersive] = useState(false);
  const [forceList, setForceList] = useState(false);

  // 深链初始化：/graph?focus=<帝王或皇子 id> · /graph?post=<官职 id>
  useEffect(() => {
    if (focusId) {
      const emperorId = getEmperor(focusId)
        ? focusId
        : princes.find((prince) => prince.id === focusId)?.emperorId;
      const located = emperorId ? locateEmperor(emperorId) : undefined;
      setTab('lineage');
      if (located && emperorId) {
        setPeriodId(located.periodId);
        setSelected(emperorId);
      }
      return;
    }
    if (focusPost) {
      const post = getPost(focusPost);
      if (post) {
        setTab('posts');
        setSystem(post.system);
        setOrg(post.org);
        setSelectedPost(post.id);
      }
    }
  }, [focusId, focusPost]);

  const periodCards = useMemo(() => listPeriods(), []);
  const systemCards = useMemo(() => listSystems(), []);

  const layer = resolveLayer({ tab, periodId, system, org });
  const isIndex = layer === 'lineage-index' || layer === 'post-index';

  const graph = useMemo(
    () => buildGraphForLayer(layer, { periodId, system, org, expanded, fullExpand }),
    [expanded, fullExpand, layer, org, periodId, system],
  );

  const activeNodeId = tab === 'lineage' ? selected : selectedPost;
  const highlightIds = useMemo(
    () => resolveHighlight(graph, tab, activeNodeId),
    [activeNodeId, graph, tab],
  );

  const onSelect = useCallback(
    (id: string) => {
      if (tab === 'lineage') {
        if (id.startsWith('agg-')) {
          setFullExpand((prev) => [...prev, id.slice(4)]);
          return;
        }
        setSelected(id);
        return;
      }
      if (id.startsWith('org-')) {
        setOrg(id.slice(4));
        setSelectedPost(null);
        return;
      }
      if (id.startsWith('rank-')) return;
      setSelectedPost(id || null);
    },
    [tab],
  );

  const onDrill = useCallback(
    (id: string) => {
      if (tab === 'lineage') {
        if (id.startsWith('agg-')) {
          setFullExpand((prev) => [...prev, id.slice(4)]);
          return;
        }
        if (getEmperor(id)) router.push(`/emperors/${id}/`);
        return;
      }
      if (id.startsWith('org-')) {
        setOrg(id.slice(4));
        setSelectedPost(null);
      }
    },
    [router, tab],
  );

  const openPeriod = useCallback((nextPeriodId: string) => {
    setPeriodId(nextPeriodId);
    setSelected(null);
    setExpanded([]);
    setFullExpand([]);
  }, []);

  const openSystem = useCallback((next: System) => {
    setTab('posts');
    setSystem(next);
    setOrg(null);
    setSelectedPost(null);
  }, []);

  const toPeriodIndex = useCallback(() => {
    setTab('lineage');
    setPeriodId(null);
    setSelected(null);
  }, []);

  const toSystemIndex = useCallback(() => {
    setSystem(null);
    setOrg(null);
    setSelectedPost(null);
  }, []);

  const toSystem = useCallback(() => {
    setOrg(null);
    setSelectedPost(null);
  }, []);

  const activePeriod = periodId ? getPeriodById(periodId) : undefined;

  const crumbs = useMemo(
    () =>
      buildCrumbs(
        layer,
        { periodName: activePeriod?.name, system: system ?? undefined, org },
        { toPeriodIndex, toSystemIndex, toSystem },
      ),
    [activePeriod?.name, layer, org, system, toPeriodIndex, toSystem, toSystemIndex],
  );

  const suggestions = useMemo(() => buildSuggestions(layer, system, org), [layer, org, system]);

  const onFindPick = useCallback(
    (id: string) => {
      if (layer === 'post-index') {
        openSystem(id as System);
        return;
      }
      if (layer === 'lineage-index' || layer === 'lineage-period') {
        const located = locateEmperor(id);
        if (located) {
          setPeriodId(located.periodId);
          setSelected(id);
        }
        return;
      }
      onSelect(id);
    },
    [layer, onSelect, openSystem],
  );

  const nodeCount = graph?.nodes.length ?? 0;
  const autoList = mobile && nodeCount > MOBILE_LIMIT;
  const useList = graph ? forceList || autoList : false;

  const onToggleExpand = useCallback(() => {
    setSelected((current) => {
      if (!current) return current;
      setExpanded((prev) =>
        prev.includes(current) ? prev.filter((id) => id !== current) : [...prev, current],
      );
      return current;
    });
  }, []);

  return {
    tab,
    setTab,
    layer,
    isIndex,
    dark,
    crumbs,
    periodCards,
    systemCards,
    tone: toneForLayer(layer, tones),
    legend: legendForLayer(layer),
    graph,
    layout: layoutForLayer(layer),
    highlightIds,
    activeNodeId,
    useList,
    nodeCount,
    listGroups: graph && !isIndex ? fallbackGroups(graph) : [],
    listCaption: autoList
      ? `共 ${nodeCount} 项，小屏已自动切换为分组列表`
      : `共 ${nodeCount} 项 · 列表视图`,
    immersive,
    onToggleImmersive: useList ? () => undefined : () => setImmersive((value) => !value),
    onToggleList: graph ? () => setForceList((value) => !value) : () => undefined,
    handleRef,
    onSelect,
    onDrill,
    toolbarTitle: toolbarTitle(layer, {
      periodName: activePeriod?.name,
      system,
      org,
    }),
    toolbarHint: useList ? `共 ${nodeCount} 项 · 已切换为分组列表` : hintForLayer(layer),
    findPlaceholder: findPlaceholderFor(layer),
    suggestions,
    onFindPick,
    openPeriod,
    openSystem,
    panelProps: {
      layer,
      periodId,
      selected,
      expanded: selected ? expanded.includes(selected) : false,
      onToggleExpand,
      onSwitchPeriod: (nextPeriod: string, emperorId: string) => {
        setPeriodId(nextPeriod);
        setSelected(emperorId);
        setExpanded([]);
      },
      org,
      selectedPost,
      onSelectPost: (id: string) => setSelectedPost(id || null),
    },
  };
}
