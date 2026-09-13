import useNestedPageExample from "../hooks/useNestedPageExample";

const AnotherNestedPage = () => {
  const { tsData, postTSData } = useNestedPageExample();
  console.log("getTSData inside ANOTHER NESTED PAGE", tsData);
  return <div>Another Nested Page</div>;
};

export default AnotherNestedPage;
