"use client";

import { useState } from "react";
import UploadVideo from "./UploadVideo";

const EMOTION_EMOJI: Record<string, string> = {
  anger: "😡",
  disgust: "🤢",
  fear: "😨",
  joy: "😄",
  neutral: "😐",
  sadness: "😢",
  surprise: "😲",
};

const SENTIMENT_EMOJI: Record<string, string> = {
  negative: "😡",
  neutral: "😐",
  positive: "😄",
};

interface InferenceProps {
  quota: {
    secretKey: string;
  };
}

export type Analysis = {
  analysis: {
    utterances: Array<{
      start_time: number;
      end_time: number;
      text: string;
      emotions: Array<{ label: string; confidence: number }>;
      sentiments: Array<{ label: string; confidence: number }>;
    }>;
  };
};

export function Inference({ quota }: InferenceProps) {
  const [analysis, setAnalysis] = useState<Analysis | null>();

  const getAverageScores = () => {
    if (!analysis?.analysis.utterances.length) return null;

    const emotionScores: Record<string, number[]> = {};
    const sentimentScores: Record<string, number[]> = {};

    analysis.analysis.utterances.forEach((utterance) => {
      utterance.emotions.forEach((emotion) => {
        if (!emotionScores[emotion.label]) emotionScores[emotion.label] = [];
        emotionScores[emotion.label]!.push(emotion.confidence);
      });
      utterance.sentiments.forEach((sentiment) => {
        if (!sentimentScores[sentiment.label])
          sentimentScores[sentiment.label] = [];
        sentimentScores[sentiment.label]!.push(sentiment.confidence);
      });
    });

    const avgEmotions = Object.entries(emotionScores).map(
      ([label, scores]) => ({
        label,
        confidence: scores.reduce((a, b) => a + b, 0) / scores.length,
      }),
    );

    const avgSentiments = Object.entries(sentimentScores).map(
      ([label, scores]) => ({
        label,
        confidence: scores.reduce((a, b) => a + b, 0) / scores.length,
      }),
    );

    const topEmotion = avgEmotions.sort(
      (a, b) => b.confidence - a.confidence,
    )[0];
    const topSentiment = avgSentiments.sort(
      (a, b) => b.confidence - a.confidence,
    )[0];

    return { topEmotion, topSentiment };
  };

  const averages = getAverageScores();

  return (
    <div className="flex h-fit w-full flex-col gap-3 md:w-1/2">
      <h2 className="text-ls font-medium text-slate-800">Inference</h2>
      <UploadVideo onAnalysis={setAnalysis} apiKey={quota.secretKey} />

      <h2 className="mt-2 text-sm text-slate-800">Overall analysis</h2>
      {averages ? (
        <div className="flex h-fit w-full flex-wrap items-center justify-center gap-6 rounded-xl border border-gray-200 p-6">
          {/* Primary Emotion */}
          <div className="flex flex-col items-center">
            <span className="text-sm font-semibold text-slate-700">
              Primary Emotion
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[40px]">
                {EMOTION_EMOJI[averages?.topEmotion?.label!]}
              </span>
              <span className="text-base font-medium capitalize text-slate-700">
                {averages?.topEmotion?.label}
              </span>
            </div>
            <span className="text-sm text-gray-500 mt-1">
              {averages.topEmotion?.confidence.toFixed(3)} (
              {(averages.topEmotion?.confidence! * 100).toFixed(0)}%)
            </span>
          </div>

          {/* Primary Sentiment */}
          <div className="flex flex-col items-center">
            <span className="text-sm font-semibold text-slate-700">
              Primary Sentiment
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[40px]">
                {SENTIMENT_EMOJI[averages?.topSentiment?.label!]}
              </span>
              <span className="text-base font-medium capitalize text-slate-700">
                {averages?.topSentiment?.label}
              </span>
            </div>
            <span className="text-sm text-gray-500 mt-1">
              {averages.topSentiment?.confidence.toFixed(3)} (
              {(averages.topSentiment?.confidence! * 100).toFixed(0)}%)
            </span>
          </div>
        </div>
      ) : (
        <div className="flex h-32 w-full items-center justify-center rounded-xl border border-dashed border-gray-200 p-4">
          <span className="text-sm text-gray-400">
            Upload a video to see overall analysis
          </span>
        </div>
      )}

      <h2 className="mt-2 text-sm text-slate-800">Analysis of utterances</h2>
      {analysis ? (
        <div className="flex flex-col gap-2">
          {analysis?.analysis.utterances.map((utterance) => {
            return (
              <div
                key={
                  utterance.start_time.toString() +
                  utterance.end_time.toString()
                }
                className="flex h-fit w-full flex-wrap justify-between gap-8 rounded-xl border border-gray-200 px-6 py-4 sm:gap-4"
              >
                {/* Time and text */}
                <div className="flex w-full max-w-24 flex-col justify-center">
                  <div className="text-sm font-semibold">
                    {Number(utterance.start_time).toFixed(1)} -{" "}
                    {Number(utterance.end_time).toFixed(1)}
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    {utterance.text}
                  </div>
                </div>

                {/* Emotions */}
                <div className="flex w-full max-w-48 flex-col gap-2">
                  <span className="text-sm font-medium">Emotions</span>
                  {utterance.emotions.map((emo) => {
                    return (
                      <div key={emo.label} className="flex items-center gap-2">
                        <span className="w-24 whitespace-nowrap text-xs text-gray-500 flex items-center gap-1">
                          {EMOTION_EMOJI[emo.label]}{" "}
                          <span className="capitalize">{emo.label}</span>
                        </span>
                        <div className="flex-1">
                          <div className="h-1 w-full rounded-full bg-gray-100">
                            <div
                              style={{ width: `${emo.confidence * 100}%` }}
                              className="h-1 rounded-full bg-gray-800"
                            ></div>
                          </div>
                          <span className="w-8 text-right text-xs">
                            {(emo.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Sentiments */}
                <div className="flex w-full max-w-48 flex-col gap-2">
                  <span className="text-sm font-medium">Sentiments</span>
                  {utterance.sentiments.map((sentiment) => {
                    return (
                      <div
                        key={sentiment.label}
                        className="flex items-center gap-2"
                      >
                        <span className="w-24 whitespace-nowrap text-xs text-gray-500 flex items-center gap-1">
                          {SENTIMENT_EMOJI[sentiment.label]}{" "}
                          <span className="capitalize">{sentiment.label}</span>
                        </span>
                        <div className="flex-1">
                          <div className="h-1 w-full rounded-full bg-gray-100">
                            <div
                              style={{
                                width: `${sentiment.confidence * 100}%`,
                              }}
                              className="h-1 rounded-full bg-gray-800"
                            ></div>
                          </div>
                          <span className="w-8 text-right text-xs">
                            {(sentiment.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex h-32 w-full items-center justify-center rounded-xl border border-dashed border-gray-200 p-4">
          <span className="text-sm text-gray-400">
            Upload a video to see analysis results
          </span>
        </div>
      )}
    </div>
  );
}
