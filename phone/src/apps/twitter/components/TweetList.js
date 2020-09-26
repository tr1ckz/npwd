import React, { useEffect } from "react";

import Nui from "../../../os/nui-events/utils/Nui";
import { List } from "../../../ui/components/List";
import { useTweets } from "../hooks/useTweets";
import Tweet from "./Tweet";

const TWEETS_REFRESH_RATE = 50000000; // TODO move this to twitter config

export function TweetList() {
  const { tweets } = useTweets();

  useEffect(() => {
    Nui.send("phone:fetchTweets", {});

    // this is a polling implementation. It is possible that
    // there is some interaction where, on a new tweet, all
    // clients are sent the updated query data. Until that can
    // be accomplished this is naive but robust.
    //
    // TODO don't call fetchTweets - implement a function that only
    // returns tweets that we don't already have
    const timeout = window.setTimeout(() => {
      Nui.send("phone:fetchTweets", {});
    }, TWEETS_REFRESH_RATE);
    return () => window.clearTimeout(timeout);
  }, []);

  return (
    <List>
      {tweets.map((tweet) => (
        <Tweet key={tweet.id} {...tweet} />
      ))}
    </List>
  );
}

export default TweetList;
