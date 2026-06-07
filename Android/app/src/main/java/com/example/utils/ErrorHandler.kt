package com.example.utils

import android.content.Context
import android.widget.Toast
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.launch
import retrofit2.HttpException
import java.io.IOException
import java.net.SocketTimeoutException
import java.net.UnknownHostException

sealed class AppError(
    open val message: String,
    open val userMessage: String,
    open val shouldRetry: Boolean = false
) {
    data class NetworkError(
        override val message: String = "Network error",
        override val userMessage: String = "No internet connection. Please check your network and try again.",
        override val shouldRetry: Boolean = true
    ) : AppError(message, userMessage, shouldRetry)

    data class ServerError(
        val code: Int,
        override val message: String = "Server error: $code",
        override val userMessage: String = "Server error occurred. Please try again later.",
        override val shouldRetry: Boolean = code >= 500
    ) : AppError(message, userMessage, shouldRetry)

    data class AuthError(
        override val message: String = "Authentication failed",
        override val userMessage: String = "Session expired. Please login again.",
        override val shouldRetry: Boolean = false
    ) : AppError(message, userMessage, shouldRetry)

    data class ConflictError(
        override val message: String = "Duplicate request",
        override val userMessage: String = "This coupon has already been claimed.",
        override val shouldRetry: Boolean = false
    ) : AppError(message, userMessage, shouldRetry)

    data class NotFoundError(
        override val message: String = "Resource not found",
        override val userMessage: String = "The requested resource was not found.",
        override val shouldRetry: Boolean = false
    ) : AppError(message, userMessage, shouldRetry)

    data class ValidationError(
        override val message: String = "Validation failed",
        override val userMessage: String = "Please check your input and try again.",
        override val shouldRetry: Boolean = false
    ) : AppError(message, userMessage, shouldRetry)

    data class UnknownError(
        override val message: String = "Unknown error",
        override val userMessage: String = "An unexpected error occurred. Please try again.",
        override val shouldRetry: Boolean = true
    ) : AppError(message, userMessage, shouldRetry)
}

object ErrorHandler {

    fun handleException(
        context: Context,
        throwable: Throwable,
        onRetry: (() -> Unit)? = null,
        scope: CoroutineScope? = null
    ): AppError {
        val error = when (throwable) {
            is UnknownHostException, is SocketTimeoutException, is IOException -> {
                AppError.NetworkError()
            }
            is HttpException -> {
                when (throwable.code()) {
                    401 -> AppError.AuthError()
                    404 -> AppError.NotFoundError()
                    409 -> AppError.ConflictError()
                    422 -> AppError.ValidationError()
                    in 500..599 -> AppError.ServerError(throwable.code())
                    else -> AppError.UnknownError()
                }
            }
            else -> {
                AppError.UnknownError()
            }
        }

        if (error.userMessage.isNotBlank()) {
            Toast.makeText(context, error.userMessage, Toast.LENGTH_LONG).show()
        }

        if (error.shouldRetry && onRetry != null && scope != null) {
            scope.launch {
                kotlinx.coroutines.delay(2000)
                onRetry.invoke()
            }
        }

        return error
    }

    fun getRetryDelay(attempt: Int): Long = when (attempt) {
        0 -> 1000L
        1 -> 3000L
        2 -> 5000L
        else -> 10000L
    }
}

suspend fun <T> safeApiCall(
    context: Context,
    apiCall: suspend () -> T,
    onError: ((AppError) -> Unit)? = null
): T? {
    return try {
        apiCall.invoke()
    } catch (e: Exception) {
        val error = ErrorHandler.handleException(context, e)
        onError?.invoke(error)
        null
    }
}
