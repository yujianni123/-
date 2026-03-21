ThisBuild / version := "0.1.0-SNAPSHOT"
ThisBuild / scalaVersion := "2.13.18"

// 添加阿里云镜像加速下载（解决网络问题）
ThisBuild / resolvers ++= Seq(
  "aliyun" at "https://maven.aliyun.com/repository/public",
  "aliyun-central" at "https://maven.aliyun.com/repository/central"
)

lazy val root = (project in file("."))
  .settings(
    name := "SparkScheduler",
    idePackagePrefix := Some("com.homework"),

    // ⚠️ 关键：添加Spark依赖！
    libraryDependencies ++= Seq(
      "org.apache.spark" %% "spark-core" % "3.3.0"
    )
  )