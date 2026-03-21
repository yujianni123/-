import org.apache.spark.{SparkConf, SparkContext}

object WordCount {
  def main(args: Array[String]): Unit = {
    // ==================== 第1步：创建 SparkConf ====================
    // 作用：配置 Spark 应用程序的运行参数
    // 设置：应用名称、运行模式（local[*]表示本地模式，使用所有CPU核心）
    val conf = new SparkConf()
      .setAppName("WordCount")           // 应用名称，会在 Web UI 显示
      .setMaster("local[*]")             // 本地模式，使用所有核心

    // ==================== 第2步：创建 SparkContext ====================
    // 作用：Spark 应用程序的入口，负责初始化所有核心组件
    // 包括：DAGScheduler、TaskScheduler、SchedulerBackend
    val sc = new SparkContext(conf)

    // ==================== 第3步：读取数据创建 RDD ====================
    // 作用：从文件系统读取文本文件，创建初始 RDD
    // textFile 方法会创建 HadoopRDD，然后通过 MapPartitionsRDD 包装
    // 此时只是元数据记录，还未实际读取数据
    val lines: RDD[String] = sc.textFile("data/words.txt")

    // ==================== 第4步：flatMap 转换操作 ====================
    // 作用：将每行文本按空格切分成单词，并将所有行的结果扁平化为一个 RDD
    // 输入：一行字符串
    // 输出：多个单词
    // 示例："hello world" -> ["hello", "world"]
    val words: RDD[String] = lines.flatMap(_.split(" "))

    // ==================== 第5步：map 转换操作 ====================
    // 作用：将每个单词映射为键值对形式 (word, 1)
    // 输入：单词字符串
    // 输出：(单词, 1) 元组
    // 示例："hello" -> ("hello", 1)
    val pairs: RDD[(String, Int)] = words.map(word => (word, 1))

    // ==================== 第6步：reduceByKey 行动操作 ====================
    // 作用：根据 key 进行聚合，相同 key 的值相加
    // 这是一个宽依赖操作（Shuffle），会触发 Stage 划分
    // 输入：(word, 1) 的 RDD
    // 输出：(word, count) 的 RDD
    val wordCounts: RDD[(String, Int)] = pairs.reduceByKey(_ + _)

    // ==================== 第7步：collect 行动操作 ====================
    // 作用：将结果从集群收集到 Driver 端
    // 这是一个行动操作（Action），会触发真正的计算
    // 返回 Array[(String, Int)] 到 Driver 内存
    val result: Array[(String, Int)] = wordCounts.collect()

    // ==================== 第8步：打印结果 ====================
    result.foreach(println)

    // ==================== 第9步：关闭 SparkContext ====================
    // 作用：释放资源，停止所有 Executor
    sc.stop()
  }
}