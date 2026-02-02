import { useActiveGames } from "@/hooks/games/use-active-games";
import { SettingsModal } from "@/components/SettingsModal";
import { Link, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

const GAMES = [
  {
    id: "wordle",
    title: "Wordle",
    description: "Guess the word in 6 tries",
    href: "/games/wordle",
    backgroundColor: "#6aaa64",
  },
  {
    id: "connections",
    title: "Connections",
    description: "Group words that share a common theme",
    href: "/games/connections",
    backgroundColor: "#ba81c5",
  },
  {
    id: "crossword",
    title: "The Mini",
    subtitle: "Crossword",
    description: "A quick crossword puzzle",
    href: "/games/crossword",
    backgroundColor: "#4a90d9",
  },
  {
    id: "sudoku",
    title: "Sudoku",
    description: "Fill the grid with numbers",
    href: "/games/sudoku",
    backgroundColor: "#f5793a",
  },
];

export default function GamesHub() {
  const { width } = useWindowDimensions();
  const today = new Date();
  const cardWidth = width * 0.75;
  const { activeGames, refresh, quitGame } = useActiveGames();
  const [showSettings, setShowSettings] = useState(false);

  // Refresh active games when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const handleQuitGame = (gameType: string, gameTitle: string) => {
    Alert.alert(
      "Quit Game",
      `Are you sure you want to quit your ${gameTitle} game? Your progress will be lost.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Quit",
          style: "destructive",
          onPress: () => quitGame(gameType),
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header with Settings Button */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.brandTitle}>Free York Games</Text>
          <Text style={styles.date}>{formatDate(today)}</Text>
        </View>
        <Pressable
          style={styles.settingsButton}
          onPress={() => setShowSettings(true)}
        >
          <Text style={styles.settingsIcon}>&#x2699;</Text>
        </Pressable>
      </View>

      {/* Settings Modal */}
      <SettingsModal
        visible={showSettings}
        onClose={() => setShowSettings(false)}
      />

      <View style={styles.carouselWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carousel}
          snapToInterval={cardWidth + 16}
          decelerationRate="fast"
        >
          {GAMES.map((game, index) => (
            <View
              key={game.id}
              style={[
                styles.card,
                {
                  width: cardWidth,
                  backgroundColor: game.backgroundColor,
                  marginLeft: index === 0 ? 24 : 16,
                  marginRight: index === GAMES.length - 1 ? 24 : 0,
                },
              ]}
            >
              <Link href={game.href as any} asChild>
                <Pressable style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{game.title}</Text>
                  {game.subtitle && (
                    <Text style={styles.cardSubtitle}>{game.subtitle}</Text>
                  )}
                  <Text style={styles.cardDescription}>{game.description}</Text>
                </Pressable>
              </Link>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Active Games Section */}
      {activeGames.length > 0 && (
        <View style={styles.activeGamesSection}>
          <Text style={styles.sectionTitle}>Continue Playing</Text>
          {activeGames.map((game) => (
            <View key={game.id} style={styles.activeGameRow}>
              <Link href={game.href as any} asChild>
                <Pressable style={styles.activeGameContent}>
                  <View
                    style={[
                      styles.activeGameDot,
                      { backgroundColor: game.backgroundColor },
                    ]}
                  />
                  <View style={styles.activeGameInfo}>
                    <Text style={styles.activeGameTitle}>{game.title}</Text>
                    <Text style={styles.activeGameProgress}>
                      {game.progress}
                    </Text>
                  </View>
                </Pressable>
              </Link>
              <Pressable
                style={styles.quitButton}
                onPress={() => handleQuitGame(game.type, game.title)}
              >
                <Text style={styles.quitButtonText}>Quit</Text>
              </Pressable>
            </View>
          ))}
        </View>
      )}

      <View style={styles.spacer} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingRight: 16,
  },
  headerLeft: {
    flex: 1,
  },
  settingsButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  settingsIcon: {
    fontSize: 24,
    color: "#787c7e",
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -0.5,
    paddingHorizontal: 24,
    marginBottom: 8,
    color: "#1a1a1b",
  },
  date: {
    fontSize: 14,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 1,
    paddingHorizontal: 24,
    marginBottom: 8,
    color: "#787c7e",
  },
  carouselWrapper: {
    height: 196,
  },
  carousel: {
    paddingVertical: 8,
  },
  card: {
    borderRadius: 16,
    height: 180,
    overflow: "hidden",
  },
  cardContent: {
    flex: 1,
    padding: 24,
    justifyContent: "flex-end",
  },
  cardTitle: {
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.5,
    marginBottom: 4,
    color: "#ffffff",
  },
  cardSubtitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
    color: "rgba(255, 255, 255, 0.85)",
  },
  cardDescription: {
    fontSize: 15,
    lineHeight: 20,
    color: "rgba(255, 255, 255, 0.85)",
  },
  spacer: {
    flex: 1,
  },
  activeGamesSection: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1b",
    marginBottom: 12,
  },
  activeGameRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f6f7f8",
    borderRadius: 12,
    marginBottom: 8,
    overflow: "hidden",
  },
  activeGameContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  activeGameDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  activeGameInfo: {
    flex: 1,
  },
  activeGameTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1b",
  },
  activeGameProgress: {
    fontSize: 13,
    color: "#787c7e",
    marginTop: 2,
  },
  quitButton: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  quitButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#c9302c",
  },
});
