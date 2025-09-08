import PageStyleManager from "@/components/PageStyle";
import BlogByIdDisplay from "./Blog";

interface BlogPageProps {
  params: {
    id: string;
  };
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { id } = await params;

  const blogId = parseInt(id);

  return (
    <>
      <PageStyleManager />
      <BlogByIdDisplay blogId={blogId} />
    </>
  );
}
