import Text "mo:core/Text";
import Array "mo:core/Array";
import List "mo:core/List";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Map "mo:core/Map";
import Order "mo:core/Order";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import OutCall "http-outcalls/outcall";

actor {
  include MixinStorage();

  type Prompt = {
    id : Text;
    title : Text;
    content : Text;
  };

  type GenerationRecord = {
    id : Text;
    prompt : Text;
    negativePrompt : ?Text;
    referenceImages : [Storage.ExternalBlob];
    timestamp : Time.Time;
    resultBlob : ?Storage.ExternalBlob;
    resultUrl : ?Text;
  };

  module Prompt {
    public func compare(p1 : Prompt, p2 : Prompt) : Order.Order {
      p1.id.compare(p2.id);
    };
  };

  module GenerationRecord {
    public func compare(r1 : GenerationRecord, r2 : GenerationRecord) : Order.Order {
      r1.id.compare(r2.id);
    };
  };

  let prompts = Map.empty<Text, Prompt>();
  let generationHistory = List.empty<GenerationRecord>();

  // Prompt Bank CRUD
  public shared ({ caller }) func addPrompt(id : Text, title : Text, content : Text) : async () {
    let prompt : Prompt = {
      id;
      title;
      content;
    };
    prompts.add(id, prompt);
  };

  public query ({ caller }) func getPrompt(id : Text) : async Prompt {
    switch (prompts.get(id)) {
      case (null) { Runtime.trap("Prompt does not exist") };
      case (?prompt) { prompt };
    };
  };

  public query ({ caller }) func getAllPrompts() : async [Prompt] {
    prompts.values().toArray().sort();
  };

  public shared ({ caller }) func deletePrompt(id : Text) : async () {
    if (not prompts.containsKey(id)) {
      Runtime.trap("Prompt does not exist");
    };
    prompts.remove(id);
  };

  // Image Generation
  public shared ({ caller }) func generateImage(prompt : Text, negativePrompt : ?Text, referenceImages : [Storage.ExternalBlob], resultBlob : ?Storage.ExternalBlob, resultUrl : ?Text) : async () {
    let record : GenerationRecord = {
      id = prompt.concat(Time.now().toText());
      prompt;
      negativePrompt;
      referenceImages;
      timestamp = Time.now();
      resultBlob;
      resultUrl;
    };
    generationHistory.add(record);
  };

  public shared ({ caller }) func postGenerateImageAPI(url : Text, prompt : Text, negativePrompt : ?Text, referenceImages : [Storage.ExternalBlob]) : async Text {
    // Placeholder for actual outcall logic. Outcall is currently not accessible in Motoko.
    // Should switch to using generic HTTP outcall function once available.
    let postContent = "Prompt scraping is currently not supported in motoko. Do this part in typescript.";
    await OutCall.httpPostRequest(url, [], postContent, transform);
  };

  // Needed for HTTP outcalls (unreachable anyway).
  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    input.response;
  };

  // Generation History
  public query ({ caller }) func getGenerationHistory() : async [GenerationRecord] {
    generationHistory.values().toArray().sort();
  };

  public shared ({ caller }) func clearHistory() : async () {
    generationHistory.clear();
  };
};
