# 日志配置说明

## 概述

项目已配置完整的日志系统，支持：
- 控制台输出
- 文件日志（自动轮转）
- 错误日志单独记录
- Celery 任务日志

## 日志文件位置

日志文件默认保存在 `logs/` 目录下：
- `app.log` - 应用所有日志
- `error.log` - 错误日志（ERROR 及以上级别）
- `celery.log` - Celery 任务日志

## 环境变量配置

在 `.env` 文件中可以配置以下参数：

```env
# 日志级别: DEBUG, INFO, WARNING, ERROR, CRITICAL
LOG_LEVEL=INFO

# 日志目录（默认: logs）
LOG_DIR=logs

# 单个日志文件最大大小（字节，默认: 10MB）
LOG_MAX_BYTES=10485760

# 保留的日志文件数量（默认: 10）
LOG_BACKUP_COUNT=10
```

## 使用方法

### 方式 1: 使用工具函数（推荐）

```python
from utils.logger import get_module_logger

logger = get_module_logger(__name__)

def my_function():
    logger.debug("调试信息")
    logger.info("普通信息")
    logger.warning("警告信息")
    logger.error("错误信息")
    logger.critical("严重错误")
```

### 方式 2: 直接使用 Flask app.logger

```python
from flask import current_app

def my_function():
    current_app.logger.info("这是一条日志")
    current_app.logger.error("这是一条错误日志")
```

### 方式 3: 使用标准 logging 模块

```python
import logging
from config.log_config import get_logger

logger = get_logger(__name__)

def my_function():
    logger.info("这是一条日志")
```

## 日志级别说明

- **DEBUG**: 详细的调试信息，通常只在诊断问题时使用
- **INFO**: 确认程序按预期运行的信息性消息
- **WARNING**: 表示发生了意外情况，但程序仍在运行
- **ERROR**: 由于更严重的问题，程序无法执行某些功能
- **CRITICAL**: 严重的错误，可能导致程序无法继续运行

## 日志格式

日志格式为：
```
2026-01-21 10:30:45 - module_name - INFO - filename.py:123 - 日志消息内容
```

包含：
- 时间戳
- 模块名称
- 日志级别
- 文件名和行号
- 日志消息

## Celery 任务日志

Celery 任务会自动记录日志到 `logs/celery.log`：

```python
from celery import shared_task
from utils.logger import get_module_logger

logger = get_module_logger(__name__)

@shared_task
def my_task():
    logger.info("任务开始执行")
    try:
        # 任务逻辑
        logger.info("任务执行成功")
    except Exception as e:
        logger.error(f"任务执行失败: {e}", exc_info=True)
        raise
```

## 日志轮转

日志文件会自动轮转：
- 当文件大小超过 `LOG_MAX_BYTES` 时，会自动创建新文件
- 保留最近 `LOG_BACKUP_COUNT` 个日志文件
- 旧文件会自动重命名为 `app.log.1`, `app.log.2` 等

## 示例

### 在 Handler 中使用日志

```python
from flask import Blueprint
from utils.logger import get_module_logger

logger = get_module_logger(__name__)
bp = Blueprint('example', __name__)

@bp.route('/example')
def example_handler():
    logger.info("处理请求: /example")
    try:
        # 业务逻辑
        result = do_something()
        logger.info(f"请求处理成功: {result}")
        return result
    except Exception as e:
        logger.error(f"请求处理失败: {e}", exc_info=True)
        raise
```

### 在 Service 中使用日志

```python
from utils.logger import get_module_logger

logger = get_module_logger(__name__)

def process_data(data):
    logger.debug(f"开始处理数据: {data}")
    
    if not data:
        logger.warning("数据为空")
        return None
    
    try:
        result = complex_operation(data)
        logger.info(f"数据处理成功，结果: {result}")
        return result
    except ValueError as e:
        logger.error(f"数据验证失败: {e}")
        raise
    except Exception as e:
        logger.critical(f"数据处理发生严重错误: {e}", exc_info=True)
        raise
```

## 注意事项

1. **日志级别**: 生产环境建议使用 `INFO` 或 `WARNING`，开发环境可以使用 `DEBUG`
2. **敏感信息**: 不要在日志中记录密码、token 等敏感信息
3. **性能**: 大量日志可能影响性能，注意控制日志级别
4. **日志清理**: 定期清理旧日志文件，避免占用过多磁盘空间
