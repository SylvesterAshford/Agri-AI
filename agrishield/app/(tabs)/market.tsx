import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Defs, LinearGradient, Stop, Path, Circle } from "react-native-svg";
import Colors from "@/constants/colors";
import {
  MARKET_DATA,
  CROP_CATEGORIES,
  AVAILABLE_DATES,
  MarketItem,
  getLatestPrice,
  getPriceChange,
  formatPrice,
  getPriceAtDate as getPriceForDateHelper,
} from "@/data/marketData";

const C = Colors.light;
const { width } = Dimensions.get("window");

type BestPriceItem = {
  item: MarketItem;
  price: { low: number | null; high: number | null; date: string };
};

type ViewMode = "list" | "compare" | "chart";

export default function MarketScreen() {
  const [activeCategory, setActiveCategory] = useState(0);
  const [selectedDate, setSelectedDate] = useState(AVAILABLE_DATES.length - 1);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [compareItems, setCompareItems] = useState<MarketItem[]>([]);
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";

  const filteredItems = useMemo(() => {
    const category = CROP_CATEGORIES[activeCategory];
    if (!category) return [];

    return MARKET_DATA.filter((item) => {
      if (!item.item_category) return false;
      return item.item_category.includes(category) ||
             (category.includes(item.item_category));
    });
  }, [activeCategory]);

  const itemsWithPrices = useMemo(() => {
    return filteredItems.filter((item) => {
      const price = getLatestPrice(item);
      return price && (price.low !== null || price.high !== null);
    });
  }, [filteredItems]);

  const bestPriceItem = useMemo<BestPriceItem | null>(() => {
    if (itemsWithPrices.length === 0) return null;

    let bestItem: BestPriceItem | null = null;
    let bestPrice = Infinity;

    itemsWithPrices.forEach((item) => {
      const price = getLatestPrice(item);
      if (price && price.high && price.high < bestPrice) {
        bestPrice = price.high;
        bestItem = { item, price };
      }
    });

    return bestItem;
  }, [itemsWithPrices]);

  const getPriceForDate = (item: MarketItem, dateIndex: number) => {
    if (dateIndex >= item.prices.length || dateIndex < 0) return null;
    const price = item.prices[dateIndex];
    return price;
  };

  const toggleCompare = (item: MarketItem) => {
    setCompareItems((prev) => {
      const exists = prev.find((i) => i.item_details === item.item_details);
      if (exists) {
        return prev.filter((i) => i.item_details !== item.item_details);
      }
      if (prev.length >= 3) return prev;
      return [...prev, item];
    });
  };

  const getTrendInfo = (item: typeof MARKET_DATA[0]) => {
    const change = getPriceChange(item);
    if (!change) return { text: "-", color: C.textSecondary };

    if (change.direction === 'up') {
      return { text: `↑ ${change.percent.toFixed(1)}%`, color: C.greenDark };
    } else if (change.direction === 'down') {
      return { text: `↓ ${change.percent.toFixed(1)}%`, color: C.redDark };
    }
    return { text: "→ 0%", color: C.textSecondary };
  };

  const selectedDateStr = AVAILABLE_DATES[selectedDate];

  // Line chart component for price trends
  const renderLineChart = (item: MarketItem, height: number = 80, showLabels: boolean = true) => {
    const prices = item.prices.filter((p) => p.high !== null).map((p) => p.high || 0);
    if (prices.length < 2) return null;

    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const range = maxPrice - minPrice || 1;
    const chartWidth = showLabels ? width - 110 : width - 70;
    const paddingX = 8;
    const pointSpacing = (chartWidth - paddingX * 2) / (prices.length - 1);

    const points = prices.map((price, i) => ({
      x: i * pointSpacing + paddingX,
      y: height - ((price - minPrice) / range) * (height - 20) - 10,
      price,
      date: item.prices[i].date,
    }));

    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

    return (
      <View style={[styles.lineChartContainer, showLabels && styles.lineChartWithLabels]}>
        {showLabels && (
          <View style={styles.chartLabels}>
            <Text style={styles.chartLabel}>{formatPrice(maxPrice)}</Text>
            <Text style={styles.chartLabel}>{formatPrice(minPrice)}</Text>
          </View>
        )}
        <View style={styles.chartArea}>
          <Svg height={height} width={chartWidth}>
            <Defs>
              <LinearGradient id="priceGradient" x1="0" x2="0" y1="0" y2="1">
                <Stop offset="0%" stopColor={C.blue} stopOpacity="0.3" />
                <Stop offset="100%" stopColor={C.blue} stopOpacity="0" />
              </LinearGradient>
            </Defs>
            <Path
              d={`${pathD} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`}
              fill="url(#priceGradient)"
            />
            <Path
              d={pathD}
              fill="none"
              stroke={C.blue}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {points.map((p, i) => (
              <Circle
                key={i}
                cx={p.x}
                cy={p.y}
                r="4"
                fill={C.card}
                stroke={C.blue}
                strokeWidth="2"
              />
            ))}
          </Svg>
        </View>
        {showLabels && (
          <View style={styles.chartDates}>
            {item.prices.map((p, i) => (
              <Text key={i} style={styles.chartDateText}>
                {p.date.split("-")[0]}
              </Text>
            ))}
          </View>
        )}
      </View>
    );
  };

  // Comparison view
  const renderComparisonView = () => {
    const itemsToShow = compareItems.length > 0 ? compareItems : itemsWithPrices.slice(0, 3);

    return (
      <View style={styles.compareContainer}>
        <Text style={styles.compareTitle}>ဈေးနှုန်း နှိုင်းယှဉ်ချက်</Text>
        <Text style={styles.compareSubtitle}>
          {selectedDateStr} ရက်နေ့ ဈေးနှုန်းများ
        </Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {itemsToShow.map((item, i) => {
            const price = getPriceForDate(item, selectedDate);
            const prevPrice = getPriceForDate(item, Math.max(0, selectedDate - 1));
            const change = price && prevPrice && price.high && prevPrice.high
              ? ((price.high - prevPrice.high) / prevPrice.high) * 100
              : 0;

            return (
              <View key={i} style={styles.compareCard}>
                <View style={styles.compareHeader}>
                  <View style={[
                    styles.compareDot,
                    { backgroundColor: i === 0 ? C.blue : i === 1 ? C.greenMedium : C.amber }
                  ]} />
                  <Text style={styles.compareItemName} numberOfLines={2}>
                    {item.item_details.replace(/ - .*/, "")}
                  </Text>
                </View>
                <Text style={styles.comparePrice}>
                  {formatPrice(price?.high ?? price?.low ?? null)}
                </Text>
                <View style={[
                  styles.compareChange,
                  { backgroundColor: (change || 0) >= 0 ? C.greenLight : C.redLight }
                ]}>
                  <Text style={[
                    styles.compareChangeText,
                    { color: (change || 0) >= 0 ? C.greenDark : C.redDark }
                  ]}>
                    {(change || 0) >= 0 ? "↑" : "↓"} {Math.abs(change || 0).toFixed(1)}%
                  </Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.toggleCompareBtn,
                    compareItems.find((x) => x.item_details === item.item_details) && styles.toggleCompareBtnActive
                  ]}
                  onPress={() => toggleCompare(item)}
                >
                  <Text style={styles.toggleCompareText}>နှိုင်းယှဉ်ရန်</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>

        {/* Comparison Bar Chart */}
        <View style={styles.barChartContainer}>
          <Text style={styles.barChartTitle}>ဈေးနှုန်း ယှဉ်တွဲကြည့်ရှုခြင်း</Text>
          <View style={styles.barChart}>
            {itemsToShow.map((item, i) => {
              const price = getPriceForDate(item, selectedDate);
              const allPrices = itemsToShow
                .map((x) => getPriceForDate(x, selectedDate)?.high || 0)
                .filter((p) => p > 0);
              const maxPrice = Math.max(...allPrices);
              const currentPrice = price?.high || 0;
              const heightPercent = maxPrice > 0 ? (currentPrice / maxPrice) * 100 : 0;

              return (
                <View key={i} style={styles.barChartItem}>
                  <View style={styles.barChartBarContainer}>
                    <View
                      style={[
                        styles.barChartBar,
                        {
                          height: `${heightPercent}%`,
                          backgroundColor: i === 0 ? C.blue : i === 1 ? C.greenMedium : C.amber
                        }
                      ]}
                    />
                  </View>
                  <Text style={styles.barChartPrice}>{formatPrice(currentPrice)}</Text>
                  <Text style={styles.barChartLabel} numberOfLines={1}>
                    {item.item_category?.replace("အမျိုးမျိုး", "") || "ပစ္စည်း"}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    );
  };

  // Chart view with detailed analysis
  const renderChartView = () => {
    const itemsToShow = itemsWithPrices.slice(0, 5);

    return (
      <View style={styles.chartViewContainer}>
        <Text style={styles.chartViewTitle}>ဈေးနှုန်း အပြောင်းအလဲ ဂရပ်</Text>

        {/* Multi-line chart */}
        <View style={styles.multiChartContainer}>
          <Text style={styles.multiChartSubtitle}>
            {CROP_CATEGORIES[activeCategory]?.replace("အမျိုးမျိုး", "") || "ကုန်စည်"} များ၏ ၇ ရက်တာ ဈေးနှုန်းပြောင်းလဲမှု
          </Text>
          <View style={styles.legend}>
            {itemsToShow.slice(0, 4).map((item, i) => {
              const colors = [C.blue, C.greenMedium, C.amber, C.purple];
              return (
                <View key={i} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: colors[i] }]} />
                  <Text style={styles.legendText} numberOfLines={1}>
                    {item.item_category?.split("အ")[0] || `ပစ္စည်း ${i + 1}`}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Sparkline charts */}
          <View style={styles.sparklinesContainer}>
            {itemsToShow.slice(0, 4).map((item, i) => {
              const colors = [C.blue, C.greenMedium, C.amber, C.purple];
              const prices = item.prices.slice(-7).filter((p) => p.high !== null).map((p) => p.high || 0);
              if (prices.length < 2) return null;

              const minPrice = Math.min(...prices);
              const maxPrice = Math.max(...prices);
              const range = maxPrice - minPrice || 1;
              const chartHeight = 40;
              const chartWidth = (width - 60) / 4 - 10;
              const paddingX = 4;
              const pointSpacing = (chartWidth - paddingX * 2) / (prices.length - 1);

              const points = prices.map((price, j) => ({
                x: j * pointSpacing + paddingX,
                y: chartHeight - ((price - minPrice) / range) * (chartHeight - 10) - 5,
              }));

              const pathD = points.map((p, j) => `${j === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
              const trend = prices[prices.length - 1] >= prices[0] ? 'up' : 'down';

              return (
                <View key={i} style={styles.sparklineItem}>
                  <Svg height={chartHeight + 10} width={chartWidth}>
                    <Path
                      d={pathD}
                      fill="none"
                      stroke={colors[i]}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {points.map((p, j) => (
                      <Circle
                        key={j}
                        cx={p.x}
                        cy={p.y}
                        r="3"
                        fill={colors[i]}
                        stroke="#fff"
                        strokeWidth="1"
                      />
                    ))}
                  </Svg>
                  <View style={[
                    styles.sparklineTrend,
                    { backgroundColor: trend === 'up' ? C.greenLight : C.redLight }
                  ]}>
                    <Text style={[
                      styles.sparklineTrendText,
                      { color: trend === 'up' ? C.greenDark : C.redDark }
                    ]}>
                      {trend === 'up' ? "↑" : "↓"}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Price distribution */}
        <View style={styles.distributionCard}>
          <Text style={styles.distributionTitle}>ဈေးနှုန်း ဖြန့်ဝေမှု</Text>
          <View style={styles.distributionBars}>
            {itemsToShow.map((item, i) => {
              const prices = item.prices.filter((p) => p.high !== null).map((p) => p.high || 0);
              if (prices.length === 0) return null;

              const currentPrice = prices[prices.length - 1];
              const allPrices = itemsToShow
                .flatMap((x) => x.prices.filter((p) => p.high !== null).map((p) => p.high || 0))
                .filter((p) => p > 0);
              const minAll = Math.min(...allPrices);
              const maxAll = Math.max(...allPrices);
              const range = maxAll - minAll || 1;
              const position = ((currentPrice - minAll) / range) * 100;

              const colors = [C.blue, C.greenMedium, C.amber, C.purple, C.red];

              return (
                <View key={i} style={styles.distributionItem}>
                  <View style={styles.distributionTrack}>
                    <View
                      style={[
                        styles.distributionMarker,
                        {
                          left: `${position}%`,
                          backgroundColor: colors[i % colors.length]
                        }
                      ]}
                    />
                  </View>
                  <Text style={styles.distributionLabel} numberOfLines={1}>
                    {item.item_details.split("-")[0]?.trim() || "ပစ္စည်း"}
                  </Text>
                  <Text style={styles.distributionValue}>{formatPrice(currentPrice)}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Market insights */}
        <View style={styles.insightsCard}>
          <Text style={styles.insightsTitle}>ဈေးကွက် သုံးသပ်ချက်</Text>
          {(() => {
            const risingItems = itemsWithPrices.filter((item) => {
              const change = getPriceChange(item);
              return change && change.direction === 'up';
            });
            const fallingItems = itemsWithPrices.filter((item) => {
              const change = getPriceChange(item);
              return change && change.direction === 'down';
            });

            return (
              <>
                <View style={styles.insightRow}>
                  <View style={[styles.insightBadge, { backgroundColor: C.greenLight }]}>
                    <Text style={[styles.insightBadgeText, { color: C.greenDark }]}>
                      တက်နေသော
                    </Text>
                  </View>
                  <Text style={styles.insightValue}>{risingItems.length} မျိုး</Text>
                </View>
                <View style={styles.insightRow}>
                  <View style={[styles.insightBadge, { backgroundColor: C.redLight }]}>
                    <Text style={[styles.insightBadgeText, { color: C.redDark }]}>
                      ကျနေသော
                    </Text>
                  </View>
                  <Text style={styles.insightValue}>{fallingItems.length} မျိုး</Text>
                </View>
                <View style={styles.insightRow}>
                  <View style={[styles.insightBadge, { backgroundColor: C.blueLight }]}>
                    <Text style={[styles.insightBadgeText, { color: C.blue }]}>
                      စုစုပေါင်း
                    </Text>
                  </View>
                  <Text style={styles.insightValue}>{itemsWithPrices.length} မျိုး</Text>
                </View>
              </>
            );
          })()}
        </View>
      </View>
    );
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.content,
        { paddingTop: Math.max(insets.top, 20) + 10 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>ဈေးကွက် မျက်မှန်</Text>
          <View style={styles.viewModeToggle}>
            <TouchableOpacity
              style={[styles.viewModeBtn, viewMode === "list" && styles.viewModeBtnActive]}
              onPress={() => setViewMode("list")}
            >
              <Text style={[styles.viewModeBtnText, viewMode === "list" && styles.viewModeBtnTextActive]}>စာရင်း</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.viewModeBtn, viewMode === "compare" && styles.viewModeBtnActive]}
              onPress={() => setViewMode("compare")}
            >
              <Text style={[styles.viewModeBtnText, viewMode === "compare" && styles.viewModeBtnTextActive]}>နှိုင်းယှဉ်</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.viewModeBtn, viewMode === "chart" && styles.viewModeBtnActive]}
              onPress={() => setViewMode("chart")}
            >
              <Text style={[styles.viewModeBtnText, viewMode === "chart" && styles.viewModeBtnTextActive]}>ဂရပ်</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.headerSub}>
          {AVAILABLE_DATES.length} ရက်တာ ဈေးနှုန်း အချက်အလက်
        </Text>
      </View>

      {/* Date selector */}
      <View style={styles.dateSelectorContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {AVAILABLE_DATES.map((date, i) => (
            <TouchableOpacity
              key={i}
              style={[
                styles.dateBtn,
                selectedDate === i && styles.dateBtnActive
              ]}
              onPress={() => setSelectedDate(i)}
            >
              <Text style={[
                styles.dateBtnText,
                selectedDate === i && styles.dateBtnTextActive
              ]}>
                {date.split("-").slice(0, 2).join("/")}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Category tabs */}
      <View style={styles.priceHero}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.cropTabsScroll}
          contentContainerStyle={styles.cropTabsContent}
        >
          {CROP_CATEGORIES.slice(0, 10).map((category, i) => {
            const displayName = category.replace("အမျိုးမျိုး", "");
            return (
              <TouchableOpacity
                key={i}
                style={[
                  styles.cropTab,
                  activeCategory === i && { backgroundColor: C.blue, borderColor: C.blue }
                ]}
                onPress={() => setActiveCategory(i)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.cropTabText,
                    activeCategory === i && { color: "#E6F1FB" }
                  ]}
                >
                  {displayName}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {bestPriceItem && viewMode === "list" && (
          <View style={styles.bestPriceRow}>
            <View>
              <Text style={styles.bestLabel}>အကောင်းဆုံး ဈေးနှုန်း</Text>
              <View style={styles.bestNumRow}>
                <Text style={styles.bestNum}>
                  {formatPrice(bestPriceItem.price.high)}
                </Text>
                <Text style={styles.bestUnit}>ကျပ်</Text>
              </View>
              <Text style={styles.bestMarket} numberOfLines={1}>
                {bestPriceItem.item.item_details}
              </Text>
              {(() => {
                const trend = getTrendInfo(bestPriceItem.item);
                return (
                  <View style={[
                    styles.priceUpBadge,
                    { backgroundColor: trend.color === C.greenDark ? C.greenLight : C.redLight }
                  ]}>
                    <Text style={[styles.priceUpText, { color: trend.color }]}>
                      {trend.text}
                    </Text>
                  </View>
                );
              })()}
            </View>
            <Text style={styles.crown}>👑</Text>
          </View>
        )}
      </View>

      {/* View-specific content */}
      {viewMode === "list" && (
        <>
          <Text style={styles.sectionLabel}>
            {CROP_CATEGORIES[activeCategory] || "ဈေးနှုန်းများ"} - {selectedDateStr}
          </Text>

          {itemsWithPrices.length > 0 ? (
            itemsWithPrices.map((item, i) => {
              const price = getPriceForDate(item, selectedDate);
              const prevPrice = getPriceForDate(item, Math.max(0, selectedDate - 1));
              const change = price && prevPrice && price.high && prevPrice.high
                ? ((price.high - prevPrice.high) / prevPrice.high) * 100
                : 0;

              if (!price) return null;

              const displayPrice = price.high || price.low;

              return (
                <View
                  key={i}
                  style={[
                    styles.marketRow,
                    i === 0 && { borderColor: C.blue, borderWidth: 1 }
                  ]}
                >
                  <View style={styles.marketLeft}>
                    <View style={styles.marketNameRow}>
                      <View
                        style={[
                          styles.marketDot,
                          { backgroundColor: i === 0 ? C.blue : "#888" }
                        ]}
                      />
                      <Text
                        style={[
                          styles.marketName,
                          i === 0 && { color: C.blue }
                        ]}
                        numberOfLines={1}
                      >
                        {item.item_details}
                      </Text>
                      {i === 0 && (
                        <View style={styles.bestBadge}>
                          <Text style={styles.bestBadgeText}>အကောင်းဆုံး</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.marketDist}>
                      {item.item_category || ""}
                    </Text>
                  </View>
                  <View style={styles.marketRight}>
                    <Text style={styles.marketPrice}>
                      {formatPrice(displayPrice)}
                    </Text>
                    <View style={[
                      styles.changeBadge,
                      { backgroundColor: (change || 0) >= 0 ? C.greenLight : C.redLight }
                    ]}>
                      <Text style={[
                        styles.changeBadgeText,
                        { color: (change || 0) >= 0 ? C.greenDark : C.redDark }
                      ]}>
                        {(change || 0) >= 0 ? "↑" : "↓"} {Math.abs(change || 0).toFixed(0)}%
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>ဈေးနှုန်း အချက်အလက် မရှိပါ</Text>
            </View>
          )}

          {/* Mini chart for best item */}
          {bestPriceItem && (
            <View style={styles.forecastCard}>
              <Text style={styles.forecastTitle}>
                ၇ ရက်တာ ဈေးနှုန်း အပြောင်းအလဲ
              </Text>
              {renderLineChart(bestPriceItem.item)}
              {(() => {
                const change = getPriceChange(bestPriceItem.item);
                return change ? (
                  <View style={[
                    styles.forecastRec,
                    { backgroundColor: change.direction === 'up' ? C.greenLight : C.redLight }
                  ]}>
                    <Text style={[
                      styles.forecastRecTitle,
                      { color: change.direction === 'up' ? C.greenDark : C.redDark }
                    ]}>
                      {change.direction === 'up' ? "ဈေးတက်နေသည်" : "ဈေးကျနေသည်"}
                    </Text>
                    <Text style={[
                      styles.forecastRecSub,
                      { color: change.direction === 'up' ? C.greenDeep : C.red }
                    ]}>
                      {change.percent.toFixed(1)}% {change.direction === 'up' ? "တက်" : "ကျ"}
                    </Text>
                  </View>
                ) : null;
              })()}
            </View>
          )}
        </>
      )}

      {viewMode === "compare" && renderComparisonView()}
      {viewMode === "chart" && renderChartView()}

      {/* Price summary for list view */}
      {viewMode === "list" && bestPriceItem && (
        <View style={styles.costsCard}>
          <Text style={styles.costsTitle}>ဈေးနှုန်း အနှစ်ချုပ်</Text>
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>အနိမ့်ဆုံး</Text>
            <Text style={styles.costValue}>
              {formatPrice(bestPriceItem.item.prices[0]?.low || null)}
            </Text>
          </View>
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>အမြင့်ဆုံး</Text>
            <Text style={styles.costValue}>
              {formatPrice(bestPriceItem.item.prices[bestPriceItem.item.prices.length - 1]?.high ?? null)}
            </Text>
          </View>
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>ပျမ်းမျှ</Text>
            <Text style={styles.costValue}>
              {(() => {
                const prices = bestPriceItem.item.prices
                  .filter((p: { high: number | null }) => p.high !== null)
                  .map((p: { high: number | null }) => (p.high || 0) as number);
                if (prices.length === 0) return "-";
                const avg = prices.reduce((a: number, b: number) => a + b, 0) / prices.length;
                return formatPrice(Math.round(avg));
              })()}
            </Text>
          </View>
          <View style={styles.summaryBar}>
            <View style={styles.summaryTrack}>
              {(() => {
                const prices = bestPriceItem.item.prices
                  .filter((p: { high: number | null }) => p.high !== null)
                  .map((p: { high: number | null }) => (p.high || 0) as number);
                if (prices.length === 0) return null;
                const min = Math.min(...prices);
                const max = Math.max(...prices);
                const current = prices[prices.length - 1];
                const percent = ((current - min) / (max - min || 1)) * 100;

                return (
                  <>
                    <View
                      style={[
                        styles.summaryFill,
                        { width: `${percent}%`, backgroundColor: percent > 50 ? C.greenDark : C.amberDark }
                      ]}
                    />
                    <View
                      style={[
                        styles.summaryMarker,
                        { left: `${percent}%` }
                      ]}
                    />
                  </>
                );
              })()}
            </View>
            <View style={styles.summaryNums}>
              <Text style={styles.summaryNum}>အနိမ့်</Text>
              <Text style={[styles.summaryNum, { color: C.greenDark }]}>လက်ရှိ</Text>
              <Text style={styles.summaryNum}>အမြင့်</Text>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: C.background,
  },
  content: {
    padding: 12,
    gap: 10,
    paddingBottom: 100,
  },
  header: {
    backgroundColor: C.card,
    padding: 14,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: C.border,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: C.text,
  },
  headerSub: {
    fontSize: 11,
    color: C.textSecondary,
    marginTop: 4,
  },
  viewModeToggle: {
    flexDirection: "row",
    gap: 4,
  },
  viewModeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: C.surface,
  },
  viewModeBtnActive: {
    backgroundColor: C.blue,
  },
  viewModeBtnText: {
    fontSize: 10,
    color: C.textSecondary,
    fontWeight: "600",
  },
  viewModeBtnTextActive: {
    color: "#fff",
  },
  dateSelectorContainer: {
    marginTop: 8,
  },
  dateBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: C.card,
    borderWidth: 0.5,
    borderColor: C.border,
    marginRight: 6,
  },
  dateBtnActive: {
    backgroundColor: C.blue,
    borderColor: C.blue,
  },
  dateBtnText: {
    fontSize: 10,
    color: C.textSecondary,
    fontWeight: "500",
  },
  dateBtnTextActive: {
    color: "#fff",
  },
  priceHero: {
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: C.border,
    padding: 14,
  },
  cropTabsScroll: {
    flexGrow: 0,
    marginBottom: 12,
  },
  cropTabsContent: {
    paddingRight: 10,
  },
  cropTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: C.border,
    marginRight: 6,
    backgroundColor: C.card,
  },
  cropTabText: {
    fontSize: 11,
    color: C.textSecondary,
    fontWeight: "500",
  },
  bestPriceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bestLabel: {
    fontSize: 11,
    color: C.textSecondary,
    marginBottom: 2,
  },
  bestNumRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  bestNum: {
    fontSize: 34,
    fontWeight: "700",
    color: C.blue,
    lineHeight: 52,
    paddingTop: 8,
  },
  bestUnit: {
    fontSize: 12,
    color: C.textSecondary,
  },
  bestMarket: {
    fontSize: 11,
    color: C.primary,
    fontWeight: "500",
    marginTop: 2,
    maxWidth: 180,
  },
  priceUpBadge: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  priceUpText: {
    fontSize: 11,
    fontWeight: "500",
  },
  crown: {
    fontSize: 28,
  },
  noDataText: {
    fontSize: 12,
    color: C.textSecondary,
    fontStyle: "italic",
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: C.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  marketRow: {
    backgroundColor: C.card,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: C.border,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  marketLeft: {
    flex: 1,
  },
  marketNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 3,
  },
  marketDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  marketName: {
    fontSize: 12,
    fontWeight: "600",
    color: C.text,
    flex: 1,
  },
  bestBadge: {
    backgroundColor: C.blueLight,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  bestBadgeText: {
    fontSize: 9,
    color: C.blue,
    fontWeight: "600",
  },
  marketDist: {
    fontSize: 10,
    color: C.textSecondary,
    paddingLeft: 14,
  },
  marketRight: {
    alignItems: "flex-end",
  },
  marketPrice: {
    fontSize: 15,
    fontWeight: "700",
    color: C.text,
  },
  changeBadge: {
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 4,
  },
  changeBadgeText: {
    fontSize: 9,
    fontWeight: "600",
  },
  marketTrend: {
    fontSize: 10,
    fontWeight: "500",
    marginTop: 2,
  },
  emptyState: {
    backgroundColor: C.card,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: C.border,
    padding: 24,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 12,
    color: C.textSecondary,
    fontStyle: "italic",
  },
  forecastCard: {
    backgroundColor: C.card,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: C.border,
    padding: 12,
  },
  forecastTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: C.text,
    marginBottom: 8,
  },
  lineChartContainer: {
    marginBottom: 8,
  },
  lineChartWithLabels: {
    flexDirection: "row",
  },
  chartLabels: {
    width: 50,
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingVertical: 10,
  },
  chartLabel: {
    fontSize: 8,
    color: C.textSecondary,
  },
  chartArea: {
    flex: 1,
    overflow: "visible",
  },
  chartDates: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
    paddingLeft: 50,
  },
  chartDateText: {
    fontSize: 8,
    color: C.textSecondary,
    flex: 1,
    textAlign: "center",
  },
  forecastRec: {
    borderRadius: 8,
    padding: 8,
  },
  forecastRecTitle: {
    fontSize: 11,
    fontWeight: "700",
  },
  forecastRecSub: {
    fontSize: 11,
    marginTop: 1,
  },
  costsCard: {
    backgroundColor: C.card,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: C.border,
    padding: 12,
  },
  costsTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: C.text,
    marginBottom: 8,
  },
  costRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  costLabel: {
    fontSize: 11,
    color: C.textSecondary,
  },
  costValue: {
    fontSize: 11,
    fontWeight: "700",
    color: C.text,
  },
  summaryBar: {
    backgroundColor: C.surface,
    borderRadius: 8,
    padding: 8,
    marginTop: 6,
  },
  summaryTrack: {
    height: 8,
    backgroundColor: "#E0DED8",
    borderRadius: 4,
    overflow: "visible",
    position: "relative",
    marginBottom: 4,
  },
  summaryFill: {
    height: 8,
    borderRadius: 4,
    position: "absolute",
  },
  summaryMarker: {
    position: "absolute",
    top: -3,
    width: 2,
    height: 14,
    backgroundColor: C.redDark,
    borderRadius: 1,
  },
  summaryNums: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryNum: {
    fontSize: 9,
    color: C.textSecondary,
    flex: 1,
    textAlign: "center",
  },
  // Comparison view styles
  compareContainer: {
    backgroundColor: C.card,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: C.border,
    padding: 12,
  },
  compareTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: C.text,
  },
  compareSubtitle: {
    fontSize: 10,
    color: C.textSecondary,
    marginBottom: 12,
  },
  compareCard: {
    width: 140,
    backgroundColor: C.surface,
    borderRadius: 10,
    padding: 10,
    marginRight: 8,
  },
  compareHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  compareDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  compareItemName: {
    fontSize: 10,
    fontWeight: "600",
    color: C.text,
    flex: 1,
  },
  comparePrice: {
    fontSize: 18,
    fontWeight: "700",
    color: C.text,
    marginBottom: 6,
  },
  compareChange: {
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  compareChangeText: {
    fontSize: 10,
    fontWeight: "600",
  },
  toggleCompareBtn: {
    backgroundColor: C.card,
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderWidth: 0.5,
    borderColor: C.border,
  },
  toggleCompareBtnActive: {
    backgroundColor: C.blue,
    borderColor: C.blue,
  },
  toggleCompareText: {
    fontSize: 9,
    color: C.textSecondary,
    fontWeight: "500",
  },
  barChartContainer: {
    marginTop: 16,
  },
  barChartTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: C.text,
    marginBottom: 10,
  },
  barChart: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    height: 120,
    paddingHorizontal: 10,
  },
  barChartItem: {
    alignItems: "center",
    flex: 1,
  },
  barChartBarContainer: {
    flex: 1,
    width: 40,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  barChartBar: {
    width: 30,
    borderRadius: 4,
    minHeight: 10,
  },
  barChartPrice: {
    fontSize: 10,
    fontWeight: "600",
    color: C.text,
    marginTop: 4,
  },
  barChartLabel: {
    fontSize: 8,
    color: C.textSecondary,
    marginTop: 2,
    width: 60,
    textAlign: "center",
  },
  // Chart view styles
  chartViewContainer: {
    gap: 10,
  },
  chartViewTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: C.text,
    marginBottom: 4,
  },
  multiChartContainer: {
    backgroundColor: C.card,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: C.border,
    padding: 12,
  },
  multiChartSubtitle: {
    fontSize: 10,
    color: C.textSecondary,
    marginBottom: 12,
  },
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 9,
    color: C.textSecondary,
  },
  sparklinesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sparklineItem: {
    alignItems: "center",
  },
  sparklineTrend: {
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
  },
  sparklineTrendText: {
    fontSize: 10,
    fontWeight: "700",
  },
  distributionCard: {
    backgroundColor: C.card,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: C.border,
    padding: 12,
  },
  distributionTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: C.text,
    marginBottom: 10,
  },
  distributionBars: {
    gap: 8,
  },
  distributionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  distributionTrack: {
    flex: 1,
    height: 4,
    backgroundColor: "#E0DED8",
    borderRadius: 2,
    position: "relative",
  },
  distributionMarker: {
    position: "absolute",
    width: 12,
    height: 12,
    borderRadius: 6,
    top: -4,
    borderWidth: 2,
    borderColor: "#fff",
  },
  distributionLabel: {
    fontSize: 9,
    color: C.textSecondary,
    width: 100,
  },
  distributionValue: {
    fontSize: 10,
    fontWeight: "600",
    color: C.text,
    width: 70,
    textAlign: "right",
  },
  insightsCard: {
    backgroundColor: C.card,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: C.border,
    padding: 12,
  },
  insightsTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: C.text,
    marginBottom: 10,
  },
  insightRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 6,
  },
  insightBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  insightBadgeText: {
    fontSize: 9,
    fontWeight: "600",
  },
  insightValue: {
    fontSize: 11,
    fontWeight: "600",
    color: C.text,
  },
});
