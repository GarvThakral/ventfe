'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { api } from '@/lib/api';
import { useNavigate } from '@/lib/router';
import { useCurrentUser } from '@/lib/use-current-user';
import { SEOHead } from '../components/SEOHead';
import { Button } from '../components/ui/button';
import { ArrowLeft, TreePine, Leaf, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface MemoryLeaf {
  id: string;
  content: string;
  created_at: string | null;
  chatName: string;
  chatEmoji: string;
  chatId: string;
}

interface BranchData {
  chatId: string;
  chatName: string;
  chatEmoji: string;
  memories: Array<{ id: string; content: string; created_at: string | null }>;
}

// Seed-based random for consistent tree layout
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generateLeafPositions(
  branches: BranchData[],
  canvasWidth: number,
  canvasHeight: number
) {
  const leaves: Array<MemoryLeaf & { x: number; y: number; size: number; color: string; delay: number }> = [];
  const totalBranches = branches.length;
  if (totalBranches === 0) return leaves;

  const trunkBaseX = canvasWidth / 2;
  const trunkBaseY = canvasHeight - 60;
  const trunkTopY = canvasHeight * 0.35;

  const branchColors = [
    '#4ade80', '#86efac', '#22c55e', '#16a34a',
    '#a3e635', '#84cc16', '#65a30d', '#10b981',
    '#34d399', '#6ee7b7', '#059669', '#047857',
  ];

  branches.forEach((branch, branchIndex) => {
    const rand = seededRandom(branchIndex * 137 + 42);
    const branchAngle = ((branchIndex + 0.5) / totalBranches) * Math.PI - Math.PI / 2;
    const branchProgress = 0.3 + (branchIndex % 3) * 0.2;

    const branchStartX = trunkBaseX + (trunkBaseX - trunkBaseX) * branchProgress;
    const branchStartY = trunkTopY + (trunkBaseY - trunkTopY) * (1 - branchProgress);

    const branchLength = 80 + rand() * 120;
    const branchEndX = branchStartX + Math.cos(branchAngle) * branchLength;
    const branchEndY = branchStartY + Math.sin(branchAngle) * branchLength * 0.6 - 40;

    const memoryCount = branch.memories.length;
    const color = branchColors[branchIndex % branchColors.length];

    branch.memories.forEach((memory, memIndex) => {
      const t = memoryCount === 1 ? 0.5 : memIndex / (memoryCount - 1);
      const spreadRadius = 25 + rand() * 35;
      const angle = rand() * Math.PI * 2;

      const baseX = branchStartX + (branchEndX - branchStartX) * (0.3 + t * 0.7);
      const baseY = branchStartY + (branchEndY - branchStartY) * (0.3 + t * 0.7);

      const x = baseX + Math.cos(angle) * spreadRadius;
      const y = baseY + Math.sin(angle) * spreadRadius * 0.7;

      leaves.push({
        ...memory,
        chatName: branch.chatName,
        chatEmoji: branch.chatEmoji,
        chatId: branch.chatId,
        x: Math.max(40, Math.min(canvasWidth - 40, x)),
        y: Math.max(40, Math.min(canvasHeight - 100, y)),
        size: 8 + rand() * 6,
        color,
        delay: branchIndex * 0.15 + memIndex * 0.08,
      });
    });
  });

  return leaves;
}

function generateBranchPaths(
  branches: BranchData[],
  canvasWidth: number,
  canvasHeight: number
) {
  const totalBranches = branches.length;
  if (totalBranches === 0) return [];

  const trunkBaseX = canvasWidth / 2;
  const trunkBaseY = canvasHeight - 60;
  const trunkTopY = canvasHeight * 0.35;

  return branches.map((branch, branchIndex) => {
    const rand = seededRandom(branchIndex * 137 + 42);
    const branchAngle = ((branchIndex + 0.5) / totalBranches) * Math.PI - Math.PI / 2;
    const branchProgress = 0.3 + (branchIndex % 3) * 0.2;

    const branchStartX = trunkBaseX;
    const branchStartY = trunkTopY + (trunkBaseY - trunkTopY) * (1 - branchProgress);

    const branchLength = 80 + rand() * 120;
    const branchEndX = branchStartX + Math.cos(branchAngle) * branchLength;
    const branchEndY = branchStartY + Math.sin(branchAngle) * branchLength * 0.6 - 40;

    const cpX = branchStartX + (branchEndX - branchStartX) * 0.5 + (rand() - 0.5) * 30;
    const cpY = branchStartY + (branchEndY - branchStartY) * 0.3 - 20;

    return {
      path: `M ${branchStartX} ${branchStartY} Q ${cpX} ${cpY} ${branchEndX} ${branchEndY}`,
      label: branch.chatEmoji,
      name: branch.chatName,
      endX: branchEndX,
      endY: branchEndY,
    };
  });
}

export function MemoryTreePage() {
  const navigate = useNavigate();
  const { user, isLoading: isUserLoading } = useCurrentUser();
  const [branches, setBranches] = useState<BranchData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLeaf, setSelectedLeaf] = useState<(MemoryLeaf & { x: number; y: number }) | null>(null);
  const [hoveredLeaf, setHoveredLeaf] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 900, height: 700 });

  useEffect(() => {
    if (!user) return;
    setIsLoading(true);
    api.getAllMemories()
      .then((data) => {
        const mapped: BranchData[] = (data || []).map((item: any) => ({
          chatId: item.chat_id,
          chatName: item.chat_name,
          chatEmoji: item.chat_emoji,
          memories: (item.memories || []),
        }));
        setBranches(mapped);
      })
      .catch(() => toast.error('Unable to load memories'))
      .finally(() => setIsLoading(false));
  }, [user]);

  useEffect(() => {
    function handleResize() {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: Math.max(600, rect.width),
          height: Math.max(500, rect.height - 20),
        });
      }
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { width, height } = dimensions;

  const leaves = useMemo(
    () => generateLeafPositions(branches, width, height),
    [branches, width, height]
  );

  const branchPaths = useMemo(
    () => generateBranchPaths(branches, width, height),
    [branches, width, height]
  );

  const trunkBaseX = width / 2;
  const trunkBaseY = height - 60;
  const trunkTopY = height * 0.35;

  const totalMemories = branches.reduce((sum, b) => sum + b.memories.length, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 via-emerald-50 to-amber-50 dark:from-slate-900 dark:via-emerald-950 dark:to-slate-900 relative overflow-hidden">
      <SEOHead
        title="Memory Tree — Vent 🌬️"
        description="Visualize all your memories as a growing tree."
      />

      {/* Floating particles in the background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-primary/10"
            initial={{ x: Math.random() * 100 + '%', y: '100%', opacity: 0 }}
            animate={{
              y: '-10%',
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: 8 + Math.random() * 8,
              repeat: Infinity,
              delay: Math.random() * 6,
              ease: 'linear',
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="relative z-20 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <TreePine className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <h1 className="text-xl font-bold">Memory Tree</h1>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          {totalMemories} {totalMemories === 1 ? 'memory' : 'memories'} across {branches.length} {branches.length === 1 ? 'person' : 'people'}
        </div>
      </header>

      {/* Tree Canvas */}
      <div ref={containerRef} className="relative z-10 flex-1 px-4" style={{ height: 'calc(100vh - 80px)' }}>
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <Leaf className="w-12 h-12 text-emerald-500" />
            </motion.div>
          </div>
        ) : totalMemories === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <TreePine className="w-24 h-24 text-muted-foreground/20 mb-6" />
            <h2 className="text-2xl font-bold mb-2 text-muted-foreground">Your tree is still a seed</h2>
            <p className="text-muted-foreground max-w-md">
              Start chatting about people in your life. As you share your thoughts, memories will grow into leaves on your tree.
            </p>
            <Button className="mt-6" onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </Button>
          </div>
        ) : (
          <svg
            viewBox={`0 0 ${width} ${height}`}
            width="100%"
            height="100%"
            className="mx-auto"
            style={{ maxHeight: 'calc(100vh - 100px)' }}
          >
            <defs>
              <radialGradient id="leaf-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="white" stopOpacity="0.4" />
                <stop offset="100%" stopColor="white" stopOpacity="0" />
              </radialGradient>
              <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
                <feOffset dx="0" dy="2" />
                <feComponentTransfer>
                  <feFuncA type="linear" slope="0.15" />
                </feComponentTransfer>
                <feMerge>
                  <feMergeNode />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <linearGradient id="trunk-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8B5E3C" />
                <stop offset="100%" stopColor="#6B3A1F" />
              </linearGradient>
            </defs>

            {/* Ground / grass */}
            <ellipse
              cx={trunkBaseX}
              cy={trunkBaseY + 20}
              rx={width * 0.4}
              ry={30}
              fill="#4ade80"
              opacity={0.15}
            />

            {/* Trunk */}
            <motion.path
              d={`M ${trunkBaseX - 12} ${trunkBaseY} 
                  C ${trunkBaseX - 10} ${trunkBaseY - 80} ${trunkBaseX - 8} ${trunkTopY + 60} ${trunkBaseX - 4} ${trunkTopY}
                  L ${trunkBaseX + 4} ${trunkTopY}
                  C ${trunkBaseX + 8} ${trunkTopY + 60} ${trunkBaseX + 10} ${trunkBaseY - 80} ${trunkBaseX + 12} ${trunkBaseY} Z`}
              fill="url(#trunk-gradient)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
            />

            {/* Roots */}
            {[-1, 0, 1].map((dir) => (
              <motion.path
                key={dir}
                d={`M ${trunkBaseX + dir * 8} ${trunkBaseY} Q ${trunkBaseX + dir * 40} ${trunkBaseY + 15} ${trunkBaseX + dir * 55} ${trunkBaseY + 25}`}
                stroke="#6B3A1F"
                strokeWidth={3}
                fill="none"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            ))}

            {/* Branches */}
            {branchPaths.map((bp, i) => (
              <g key={i}>
                <motion.path
                  d={bp.path}
                  stroke="#8B5E3C"
                  strokeWidth={4 - i * 0.3}
                  fill="none"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1, delay: 0.8 + i * 0.15 }}
                />
                {/* Branch label */}
                <motion.text
                  x={bp.endX}
                  y={bp.endY - 12}
                  textAnchor="middle"
                  fontSize="16"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5 + i * 0.15 }}
                >
                  {bp.label}
                </motion.text>
                <motion.text
                  x={bp.endX}
                  y={bp.endY + 2}
                  textAnchor="middle"
                  fontSize="8"
                  fill="currentColor"
                  className="fill-muted-foreground"
                  fontWeight="600"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.7 }}
                  transition={{ delay: 1.6 + i * 0.15 }}
                >
                  {bp.name.length > 12 ? bp.name.slice(0, 12) + '…' : bp.name}
                </motion.text>
              </g>
            ))}

            {/* Leaves */}
            {leaves.map((leaf) => {
              const isHovered = hoveredLeaf === leaf.id;
              const isSelected = selectedLeaf?.id === leaf.id;
              return (
                <motion.g
                  key={leaf.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: isHovered || isSelected ? 1.5 : 1,
                    opacity: 1,
                  }}
                  transition={{
                    scale: { type: 'spring', stiffness: 300 },
                    opacity: { duration: 0.4, delay: leaf.delay + 1.2 },
                  }}
                  style={{ cursor: 'pointer', transformOrigin: `${leaf.x}px ${leaf.y}px` }}
                  onMouseEnter={() => setHoveredLeaf(leaf.id)}
                  onMouseLeave={() => setHoveredLeaf(null)}
                  onClick={() => setSelectedLeaf(leaf)}
                >
                  {/* Leaf glow */}
                  <circle
                    cx={leaf.x}
                    cy={leaf.y}
                    r={leaf.size + 4}
                    fill={leaf.color}
                    opacity={isHovered || isSelected ? 0.3 : 0.08}
                  />
                  {/* Leaf body */}
                  <circle
                    cx={leaf.x}
                    cy={leaf.y}
                    r={leaf.size}
                    fill={leaf.color}
                    filter="url(#shadow)"
                    opacity={0.85}
                  />
                  {/* Leaf shine */}
                  <circle
                    cx={leaf.x - leaf.size * 0.25}
                    cy={leaf.y - leaf.size * 0.25}
                    r={leaf.size * 0.35}
                    fill="white"
                    opacity={0.3}
                  />
                  {/* Sway animation */}
                  <animateTransform
                    attributeName="transform"
                    type="translate"
                    values={`0,0; ${Math.sin(leaf.delay * 10) * 2},${Math.cos(leaf.delay * 7) * 1.5}; 0,0`}
                    dur={`${3 + leaf.delay}s`}
                    repeatCount="indefinite"
                  />
                </motion.g>
              );
            })}

            {/* Hover tooltip */}
            {hoveredLeaf && !selectedLeaf && (() => {
              const leaf = leaves.find(l => l.id === hoveredLeaf);
              if (!leaf) return null;
              const tooltipWidth = 180;
              const tooltipX = Math.max(10, Math.min(width - tooltipWidth - 10, leaf.x - tooltipWidth / 2));
              const tooltipY = leaf.y - 45;
              return (
                <g>
                  <rect
                    x={tooltipX}
                    y={tooltipY}
                    width={tooltipWidth}
                    height={30}
                    rx={8}
                    fill="var(--card)"
                    stroke="var(--border)"
                    strokeWidth={1}
                    opacity={0.95}
                  />
                  <text
                    x={tooltipX + tooltipWidth / 2}
                    y={tooltipY + 19}
                    textAnchor="middle"
                    fontSize="10"
                    fill="currentColor"
                    className="fill-foreground"
                  >
                    {leaf.content.length > 32 ? leaf.content.slice(0, 32) + '…' : leaf.content}
                  </text>
                </g>
              );
            })()}
          </svg>
        )}

        {/* Selected Memory Popup */}
        <AnimatePresence>
          {selectedLeaf && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md"
            >
              <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{selectedLeaf.chatEmoji}</span>
                      <span className="text-sm font-semibold">{selectedLeaf.chatName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedLeaf.created_at && (
                        <span className="text-[10px] text-muted-foreground">
                          {formatDistanceToNow(new Date(selectedLeaf.created_at), { addSuffix: true })}
                        </span>
                      )}
                      <button
                        onClick={() => setSelectedLeaf(null)}
                        className="p-1 rounded-full hover:bg-muted transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed text-foreground/90">
                    {selectedLeaf.content}
                  </p>
                  <div className="mt-3 flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs gap-1"
                      onClick={() => navigate(`/chat/${selectedLeaf.chatId}`)}
                    >
                      Open Chat →
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
