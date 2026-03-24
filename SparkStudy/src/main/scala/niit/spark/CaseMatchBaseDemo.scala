object CaseMatchBaseDemo {
    def main(args: Array[String]):Unit = {
      //定义测试变量
      val testVal1 = 5
      val testVal2 = "scala"
      val testVal3 = false

      //case match 基础值匹配
      def matchBase(x: Any):String = x match{
        //精准匹配常量
        case 1 => "匹配数字1"
        case 5 => "匹配数字5"
        case "scala" => "匹配字符串scala"
        case true => "匹配布尔值true"
        //通配符：匹配所有未命中情况（必须写否则报错）
        case _ => "未匹配到任何值"
      }
      //调用测试
      println(matchBase(testVal1))
      println(matchBase(testVal2))
      println(matchBase(testVal3))
    }


}

