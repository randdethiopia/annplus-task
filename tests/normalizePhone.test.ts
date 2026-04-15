import { describe, expect, it } from "vitest";
import { normalizePhone } from "../src/lib/utils";

describe("normalizePhone", () => {
  it("normalizes local 09 prefix", () => {
    expect(normalizePhone("0912345678")).toBe("+251912345678");
  });

 

  it("normalizes 9 prefix without leading zero", () => {
    expect(normalizePhone("912345678")).toBe("+251912345678");
   
  });

  it("keeps existing + prefix", () => {
    expect(normalizePhone("+251912345678")).toBe("+251912345678");
  });

  it("converts 00 prefix to +", () => {
    expect(normalizePhone("00251912345678")).toBe("+251912345678");
  });

  it("handles 251 without +", () => {
    expect(normalizePhone("251912345678")).toBe("+251912345678");
  });

  it("strips formatting characters", () => {
    expect(normalizePhone("+251-912-345-678")).toBe("+251912345678");
  });

  it("returns empty string for blank input", () => {
    expect(normalizePhone("   ")).toBe("");
  });
});
