import { NextRequest, NextResponse } from "next/server";

interface TwitterMetrics {
  tweet_count: number;
  avg_likes: number;
  avg_retweets: number;
  top_hashtags: string[];
  error?: string;
}

export async function POST(req: NextRequest) {
  try {
    const { handle } = await req.json();
    const bearer = process.env.TWITTER_BEARER_TOKEN;

    if (!bearer) {
      return NextResponse.json(
        { error: "Twitter API token not configured" },
        { status: 500 }
      );
    }

    if (!handle) {
      return NextResponse.json(
        { error: "Twitter handle is required" },
        { status: 400 }
      );
    }

    // Step 1: Get user ID by handle
    const userRes = await fetch(
      `https://api.twitter.com/2/users/by/username/${handle}`,
      {
        headers: { Authorization: `Bearer ${bearer}` },
      }
    );

    if (!userRes.ok) {
      return NextResponse.json(
        { error: "Failed to fetch Twitter user" },
        { status: userRes.status }
      );
    }

    const user = await userRes.json();
    if (!user.data) {
      return NextResponse.json(
        { error: "Twitter user not found" },
        { status: 404 }
      );
    }

    const userId = user.data.id;

    // Step 2: Get recent tweets with metrics
    const tweetsRes = await fetch(
      `https://api.twitter.com/2/users/${userId}/tweets?max_results=10&tweet.fields=public_metrics,created_at`,
      {
        headers: { Authorization: `Bearer ${bearer}` },
      }
    );

    if (!tweetsRes.ok) {
      return NextResponse.json(
        { error: "Failed to fetch tweets" },
        { status: tweetsRes.status }
      );
    }

    const tweetsData = await tweetsRes.json();
    const tweets = tweetsData.data || [];

    if (tweets.length === 0) {
      return NextResponse.json({
        tweet_count: 0,
        avg_likes: 0,
        avg_retweets: 0,
        top_hashtags: [],
      });
    }

    let totalLikes = 0;
    let totalRetweets = 0;
    const hashtagMap: Record<string, number> = {};

    tweets.forEach((tweet: any) => {
      const metrics = tweet.public_metrics;
      totalLikes += metrics.like_count;
      totalRetweets += metrics.retweet_count;

      // Extract hashtags using regex
      const hashtags = tweet.text.match(/#[a-zA-Z0-9_]+/g);
      if (hashtags) {
        hashtags.forEach((tag: string) => {
          const clean = tag.toLowerCase();
          hashtagMap[clean] = (hashtagMap[clean] || 0) + 1;
        });
      }
    });

    // Calculate averages
    const avgLikes = Math.round(totalLikes / tweets.length);
    const avgRetweets = Math.round(totalRetweets / tweets.length);

    // Get top hashtags
    const topHashtags = Object.entries(hashtagMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag]) => tag);

    const response: TwitterMetrics = {
      tweet_count: tweets.length,
      avg_likes: avgLikes,
      avg_retweets: avgRetweets,
      top_hashtags: topHashtags,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Twitter API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch Twitter insights" },
      { status: 500 }
    );
  }
}
