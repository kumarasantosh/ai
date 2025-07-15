import Image from "next/image";
import Link from "next/link";
import React from "react";

const CTA = () => {
  return (
    <section className="cta-section">
      <div className="cta-badge">Start Learning</div>
      <h2 className="text-3xl font-semibold">Build and personalize Learning</h2>
      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Iure itaque
        atque repellat d
      </p>
      <Image width={332} height={232} src="images/cta.svg" alt="" />
      <button className="btn-primary">
        <Image width={12} height={12} src="/icons/plus.svg" />
        <Link href="/companions/new">
          <p>Start Building</p>
        </Link>
      </button>
    </section>
  );
};

export default CTA;
